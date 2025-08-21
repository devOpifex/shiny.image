#' Image Upload Input
#'
#' Create an image upload input with drag-and-drop, paste, and file selection support.
#'
#' @param inputId Character string. The input slot that will be used to access the value.
#' @param label Character string. Display label for the control, or NULL for no label.
#' @param accept Character string. File types to accept (default: image formats).
#' @param placeholder Character string. Placeholder text for the upload area.
#' @param multiple Logical. Whether to allow multiple file uploads.
#'
#' @examples
#' library(shiny)
#'
#' ui <- fluidPage(
#'  imageInput("image_upload", "Upload an image",
#'             placeholder = "Drag & drop, paste, or click to select image")
#' )
#'
#' server <- function(input, output){
#'
#'  observeEvent(input$image_upload, {
#'    if(!is.null(input$image_upload)) {
#'      print(paste("Image uploaded:", input$image_upload$name))
#'    }
#'  })
#'
#' }
#'
#' if(interactive())
#'  shinyApp(ui, server)
#'
#' @importFrom shiny tags tagList div
#' @importFrom htmltools htmlDependency
#'
#' @export
imageInput <- function(
  inputId,
  label = NULL,
  accept = "image/*",
  placeholder = "Drag & drop, paste, or click to select image",
  multiple = FALSE
) {
  stopifnot(!missing(inputId))
  stopifnot(is.character(inputId))

  dep <- htmltools::htmlDependency(
    name = "imageBinding",
    version = "1.0.0",
    src = c(file = system.file("packer", package = "shiny.image")),
    script = "image.js",
    stylesheet = "image.css"
  )

  input_tag <- tags$input(
    id = paste0(inputId, "_file"),
    type = "file",
    accept = accept,
    multiple = multiple,
    style = "display: none;"
  )

  upload_area <- div(
    class = "image-upload-area",
    tabindex = "0",
    div(
      class = "upload-content",
      tags$i(class = "upload-icon"),
      div(class = "upload-text", placeholder)
    )
  )

  thumbnail_area <- div(
    class = "image-thumbnail-container",
    style = "display: none;"
  )

  container <- div(
    id = inputId,
    class = "imageBinding image-input-container",
    if (!is.null(label)) {
      tags$label(class = "control-label", `for` = inputId, label)
    },
    input_tag,
    upload_area,
    thumbnail_area
  )

  tagList(dep, container)
}
