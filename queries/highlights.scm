; Inherit Python highlighting
; (query inherits from tree-sitter-python)

; IPython line magic highlighting (%command)
(line_magic
  (magic_operator) @keyword.directive)

(line_magic
  name: (magic_name) @function.macro)

(line_magic
  arguments: (magic_arguments) @string)

; IPython cell magic highlighting (%%command)
(cell_magic
  (cell_magic_operator) @keyword.directive)

(cell_magic
  name: (magic_name) @function.macro)

(cell_magic
  arguments: (magic_arguments) @string)

; Shell escape highlighting
(shell_escape
  (shell_operator) @keyword.directive)

(shell_escape
  command: (shell_content) @string.special)
