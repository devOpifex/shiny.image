# Demo script for shiny.image package
library(shiny)
library(shiny.image)

# Simple demo app
ui <- fluidPage(
  titlePanel("Image Upload Demo"),
  
  fluidRow(
    column(6,
      h3("Single Image Upload"),
      imageInput(
        inputId = "single_image",
        label = "Upload a single image",
        placeholder = "Drag & drop, paste, or click to select image"
      ),
      verbatimTextOutput("single_output")
    ),
    
    column(6,
      h3("Multiple Images Upload"),
      imageInput(
        inputId = "multiple_images", 
        label = "Upload multiple images",
        placeholder = "Drag & drop, paste, or click to select images",
        multiple = TRUE
      ),
      verbatimTextOutput("multiple_output")
    )
  )
)

server <- function(input, output, session) {
  
  # Handle single image
  output$single_output <- renderText({
    if (is.null(input$single_image)) {
      "No image uploaded"
    } else {
      paste(
        "Image uploaded:",
        "Name:", input$single_image$name,
        "Size:", format(input$single_image$size, big.mark = ","), "bytes",
        "Type:", input$single_image$type,
        "Data URL length:", nchar(input$single_image$dataURL),
        sep = "\n"
      )
    }
  })
  
  # Handle multiple images
  output$multiple_output <- renderText({
    if (is.null(input$multiple_images) || length(input$multiple_images) == 0) {
      "No images uploaded"
    } else {
      images_info <- sapply(seq_along(input$multiple_images), function(i) {
        img <- input$multiple_images[[i]]
        paste("Image", i, "- Name:", img$name, "Size:", format(img$size, big.mark = ","), "bytes")
      })
      paste(c(paste("Total images:", length(input$multiple_images)), images_info), collapse = "\n")
    }
  })
}

# Run the app
if (interactive()) {
  shinyApp(ui, server)
}