# staruml-uml-generator-extension
A StarUML extension which makes it possible to generate UML based on existing module structure.

It currently supports the following languages:

- PHP
    - Interfaces  
    - Classes (abstract)
    - Traits
    - Functions (abstract, static)
    - Class properties (abstract, static, visibility modifier)
    - Constants

### TODO
- Detect return and param types for related UML Elements.
    - The correct UML Element should be selected based on the namespace of the variable
- Handle cases where documentation exists already. Show info dialog with overwrite?
- Replace regex function/variable detection with a more reliable approach (PHP Reflection?)

### Installation

1. Show **Extension Manager** by selecting **Tools | Extension Manager**
2. Select **Install From URL** button.
3. Enter URL: `https://github.com/peterprintbv/staruml-uml-generator-extension.git` on input box
4. Press Install button.

### Usage

1. Install extension using aforementioned installation guide.
2. Open the project you want to generate documentation for.
3. In **Tools | Generate docs**, select the option **Generate docs**.
4. Select and **open** the directory you want to generate docs for.
5. After a short while, your UML should have been generated.