---
title: Converting public images from OCI to Docker with Skopeo
date: "2023-08-19T23:46:37.121Z"
template: "post"
draft: true
slug: "convert-oci-image-to-docker-aws-ecr"
category: "Containerization"
tags:
  - "Containerization"
  - "AWS"
  - "Docker"
description: ""
socialImage: ""
---

# Converting public images from OCI to Docker with Skopeo

## Problem statement: Existing docker-compose files that run a combination of custom-built images and publicly available base images suddenly start failing to run. The error displayed indicates that docker-compose can still find the specific images, but that the manifest format is incompatible. 

	ERROR: mediaType in manifest should be 'application/vnd.docker.distribution.manifest.v2+json' not 'application/vnd.oci.image.manifest.v1+json'

## Solution overview: The publicly available RabbitMQ image from Dockerhub was recently rebuilt and made available in OCI by default. We use a dockerized version of skopeo (https://github.com/containers/skopeo) to make a copy of this image, convert it to an image with a Docker manifest, and push to AWS ECR for use. 

This approach is based on Ramon Esparza's original post here: https://blog.ramonesparza.net/2022/04/23/terraform_copy_images/

### Solution

#### Tools needed:
* Docker (examples here use Docker Desktop 4.19.0)
* AWS CLI (examples use aws-cli/2.13.9)
* Existing AWS ECR repository (mine is us-west-2)

#### Setup Skopeo container locally:
`docker pull ananace/skopeo`
`docker run -it --platform linux/amd64 ananace/skopeo inspect docker://library/rabbitmq:3.9`


#### Authenticate to AWS ECR (we'll use this password in the next step):
`export PWD=$(aws ecr get-login-password --region us-west-2) && echo $PWD`

#### Copy the RabbitMQ image to AWS ECR

`docker run -it --platform linux/amd64 ananace/skopeo copy -f v2s1 --dest-creds AWS:${PWD} docker://library/rabbitmq:3.9 docker://442998785547.dkr.ecr.us-west-2.amazonaws.com/rabbitmq:latest`

#### Inspect the image and confirm it now has a Docker manifest
`docker run -it --platform linux/amd64 ananace/skopeo inspect --creds AWS:${PWD} docker://442998785547.dkr.ecr.us-west-2.amazonaws.com/rabbitmq:latest`





