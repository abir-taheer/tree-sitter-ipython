; Injections for cell magics with other languages
; %%bash, %%sh -> bash
; %%html -> html
; %%javascript, %%js -> javascript
; %%markdown -> markdown

; Shell escape content could be injected as bash
(shell_escape
  command: (shell_content) @injection.content
  (#set! injection.language "bash"))
