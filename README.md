# shiny.image

An R package that provides a custom Shiny input widget for uploading images with support for drag-and-drop, paste from clipboard, and traditional file selection. Features thumbnail previews and base64 encoding for seamless integration with Shiny applications.

## Installation

```r
# Install from local source
devtools::install_local("path/to/shiny.image")
```

## Example

```r
library(shiny)
library(shiny.image)

ui <- fluidPage(
  titlePanel("Image Upload Example"),
  
  imageInput(
    inputId = "image_upload",
    label = "Upload an image",
    placeholder = "Drag & drop, paste, or click to select image"
  ),
  
  verbatimTextOutput("image_info")
)

server <- function(input, output, session) {
  observeEvent(input$image_upload, {
    print(input$image_upload)
  })
}

shinyApp(ui, server)
```
