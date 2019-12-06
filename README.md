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

The post-processing function is used to process the response payload and build up an array of three-dimensional items (x,y,z). Typically for a time chart, you would use:

* x: timestamp
* y: value
* z: serie's name

#### Axes processing

Under axes processing you have the possibility to define function for formating and scaling the x and y axes.

### Settings

The settings tab will provide configuration options for the visualization as wells as for managing dependencies between dashlets.

#### Display

Here you manage most display options such as setting title, legend options, managing the refresh mode and more...

Most importantly that's where you will choose the type of visualization between:

* seriesTable
* singleValueTable
* singleValueFullText
* lineChart
* multiBarChart
* scatterChart
* discreteBarChart
* stackedAreaChart

#### Coms

You have the possiblity to link dashlets between each other to avoid firing multiple time the same request when applicable.
In this section, you can define whether this dashlet is a master one or a slave. In the later case you can reference the master dashlet to be used.

### Status

This last tab of the configuration mode not only give you the status by showing alerts under the info section, it also give the possibility to test the dashler under the Execution view

Finally to can save/copy the dashlet in the Manage section.


## Dashboards

# Sessions

# Presets

# API
## Core classes
## Objects defaults

# Examples

