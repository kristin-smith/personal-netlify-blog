'use strict';

module.exports = {
  url: 'https://lumen.netlify.com',
  pathPrefix: '/',
  title: 'Blog by Kristin Smith',
  subtitle: 'DevOps personal blog to educate, hold accountable, and connect with others',
  copyright: '© All rights reserved.',
  disqusShortname: '',
  postsPerPage: 4,
  googleAnalyticsId: 'UA-73379983-2',
  useKatex: false,
  menu: [
    {
      label: 'About Me',
      path: '/pages/about'
    },
    {
      label: 'Blog',
      path: '/'
    },
    {
      label: 'Speaking',
      path: '/pages/speaking'
    },
  ],
  author: {
    name: 'Kristin Smith',
    photo: '/park-headshot-square.jpg',
    bio: 'DevOps engineer and  public speaker based in Denver, Colorado',
    contacts: {
      twitter: '@KristinInTech',
      github: 'github.com/kristin-smith',
      linkedin: 'https://www.linkedin.com/in/kristinmariesmith/'
    }
  }
};
