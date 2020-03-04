[![Build Status](https://travis-ci.com/icalvo/peoplehr.svg?branch=master)](https://travis-ci.com/icalvo/peoplehr)

# PeopleHR Time Assignment Filler

This command line utility fills daily time assignments automatically.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [Firefox](https://firefox.com/).

### Installing

```
npm install @ignaciocalvo/peoplehr -g
```

Create `~/.peoplehr/config.json` and fill your values there. The following is an example:

```json
{
  "peoplehr": "https://business.peoplehr.net/",
  "email": "your.email@business.com",
  "password": "your.password"
}
```
**Note for Windows users:** `~` folder is stored in the `%USERPROFILE%` environment variable and is typically similar to: `C:\Users\username`.

### Usage

Fill the current date:
```
peoplehr
```

Fill a specific date:
```
peoplehr 2020-02-04
```



## Built With

* [Selenium](https://www.npmjs.com/package/selenium-webdriver/)

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Ignacio Calvo** - [ignaciocalvo](https://github.com/ignaciocalvo)
