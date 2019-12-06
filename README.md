# exense-visualization
visualization packages for exense's web apps

# Concepts
## Dashlets

A dashlet is the smallest visualization entity that can be created. It is used to query, transform, format and visualize the results of a web query.

### Query

The query tab is composed of 2 sections : the service definition and the service input.

#### Service section
The service  section is used to define the following settings:
- **Service Type**: either Simple or Asynchronous
- **Service Method**: the HTTP method used to query your service. Available values are **Get, Post, Put, Delete and Patch**
- **Service URL**: the URL of the service you want to target

#### Input section
In the service input section, you can choose between 2 kinds of input:
- **RAW**: allow you to send a static payload and some URL parameters to your service
- **Template**: allow you to create the placeholders of your choice and use them to dynamically create the service payload and URL 

### Transform

The transform tab is composed of 3 sections : the Pre-processing , Post-processing and Axes processing function definition.

#### Pre-processing

The pre-processing function is used to prepare the url and payload data based on the defined templates and place holders. The default function should cover most cases.

#### Post-processing

The post-processing function is used to process the response payload and build up an array of three-dimensional items (x,y,z). Typically for a timechart, you would use:
*x: timestamp
*y: value
*z: serie's name

#### Axes processing

### Setings
### Status

## Dashboards

# Sessions

# Presets

# API
## Core classes
## Objects defaults

# Examples

