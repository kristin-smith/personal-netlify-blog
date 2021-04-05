---
title: Prometheus Relabeling for AWS Metadata
date: "2021-04-04T13:46:37.121Z"
template: "post"
draft: false
slug: "prometheus-aws-metadata-post"
category: "Observability"
tags:
  - "Infrastructure"
  - "AWS"
  - "Prometheus"
description: "Add AWS Metadata to your Prometheus metrics to help compare performance and streamline job configurations"
socialImage: "/media/shane-aldendorff-magnifying-glass.jpg"
---
#How can Prometheus relabeling help us troubleshoot our metrics?

[Prometheus](https://prometheus.io/docs/introduction/overview/) is a popular and powerful open source monitoring and alerting system, with a vibrant user community and almost a decade of development. Metrics are stored as time-series data, and flexible configurations can discover and scrape information from a variety of cloud providers in your ecosystem through custom jobs. Addon libraries for instrumentating applications allow Prometheus to collect application metrics as well as system-level monitoring. Metrics can be exported to a number of visualization products, although the most common pairing is Prometheus and Grafana (or Grafana Cloud, the hosted solution).

While Prometheus is strong out-of-the-box, a little sustained effort to strengthen and tune the metadata it collects about your monitoring targets can really make it sing.

![A magnifying glass over part of a machine, all cogs and wheels](/media/shane-aldendorff-magnifying-glass.jpg)

Prometheus metrics are augmented by any number of user-defined key/value pairs. This extra information adds dimensions to the metrics. For example, a metric might track the number of Redis cache hits returned for an application. That data is useful, but maybe too aggregated to help during pinpointed perforamnce testing. Adding a key/value pair that correlates redis hits with particular Redis keys tells a developer a better story. It becomes easier to find deviations in patterns, and drill down into the performance of individual keys, potential pointing to changes that need to be made in the application code.

[Relabeling](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config) is a powerful component of Prometheus job configuration. Reading through the relabeling documentation, we can see that a number of fields are automatically mapped from the source (your infrastructure or service, like an EC2 instance) and the destination metrics that will be stored in Prometheus. Specifically, Prometheus temporarily maps a number of __meta_* fields with provider-specific metadata but these fields are then dropped by default when the job is completed. Why? Well, metadata isn't always helpful and it takes up space. 

It's our job as observability engineers to determine when that provider metadata is worth keeping around. 

*******

#Why would we want to relabel with AWS metadata?

To my eyes, provider metadata can help us in two major ways: comparison/anomaly detection, and streamlining job definitions. 

1. Metadata can help compare metrics by adding dimensions for hardware (AMI, OS, instance type) as well as software-related information like release identifier. For example, in our Redis example above, we can tie release information (in AWS, oftentimes helpfully supplied by AWS CodeDeploy) to the EC2 hosts outputting the application metrics. Seeing the release information in conjunction with the Redis key metrics can confirm that the updates made in the latest release improved the performance of the troublesome key. 
   
   Comparison-based metadata can also be selectively turned on while a feature is being tested or while you run a specific experiment. It may not always be useful, but it could be perfect for a particular situation.

2. The second benefit, streamlining Prometheus job definitions, has been very helpful as my team has refactored our Prometheus configurations to speed up the deployment process. Previously, we wrote jobs for each environment ("development-application-X", "staging-application-X", "production-application-X") based on our process. Now, we can write one job ("application-X") and use metadata and Grafana variables to separate metrics by environment and - bonus! - compare between environments for certain enhancements developers are working on.

*******

#The actual relabeling snippet:

Ok, but how do we actually relabel? 

Keep in mind that relabeling steps are processed in order - envision a funnel. In this example, I use the first relabel config (looking for the EC2 tag named "Application") to select just that subset of EC2 instances. 

Then, the second config block looks for the EC2 tag named "Environment" on that subset of EC2 instances. The current label  that holds that information (__meta_ec2_tag_Environment) is dropped by default, along with all other labels that start with __, so this step "relabels" that information with a new label "environment" that is then stored right alongside the job's metric in the time series database. 

When developers construct Grafana dashboards that access this job's data, they'll add a variable based on this "environment" dimension to isolate the instances they want to look at.

`- job_name: 'application_ec2_scrape'
   scrape_interval: 10s
   honor_labels: true
   ec2_sd_configs:
     - region: us-east-1
       access_key: <access_key>
       secret_key: <secret_key>
  relabel_configs:
    - source_labels: [__meta_ec2_tag_Application]
      regex: ^application-X
      action: keep
    - source_labels: [__meta_ec2_tag_Environment]
      regex: *
      target_label: environment
      replacement: $1`
     
 *Social image by [Shane Aldendorff](https://unsplash.com/photos/mQHEgroKw2k?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink)*