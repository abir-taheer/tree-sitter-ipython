# tree-sitter-ipython

A tree-sitter grammar for IPython/Jupyter that extends tree-sitter-python to support magic commands and shell escapes.

## Features

- **Line Magics** (`%`): `%matplotlib inline`, `%timeit x = 1`, `%pwd`
- **Cell Magics** (`%%`): `%%time`, `%%bash`, `%%writefile test.py`
- **Shell Escapes** (`!`): `!pip install pandas`, `!ls -la`
- Full Python syntax support (inherited from tree-sitter-python)

## Installation

```bash
npm install tree-sitter-ipython
```

## Usage

```javascript
const Parser = require('tree-sitter');
const IPython = require('tree-sitter-ipython');

const parser = new Parser();
parser.setLanguage(IPython);

const code = `
%matplotlib inline
import pandas as pd
!pip install numpy
%%time
x = sum(range(1000))
`;

const tree = parser.parse(code);
console.log(tree.rootNode.toString());
```

## Node Types

### Line Magic
```
(line_magic
  (magic_operator)      ; the % symbol
  name: (magic_name)    ; command name like "matplotlib"
  arguments: (magic_arguments))  ; optional arguments like "inline"
```

### Cell Magic
```
(cell_magic
  (cell_magic_operator) ; the %% symbol
  name: (magic_name)    ; command name like "time"
  arguments: (magic_arguments))  ; optional arguments
```

### Shell Escape
```
(shell_escape
  (shell_operator)      ; the ! symbol
  command: (shell_content))  ; the shell command
```

## Development

```bash
# Install dependencies
npm install

# Generate parser
npm run generate

# Build native module
npm run build

# Run tests
npm test
```

## License

MIT
