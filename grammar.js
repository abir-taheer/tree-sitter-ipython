/**
 * @file IPython grammar for tree-sitter (extends Python)
 * @author Abir Taheer
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />

const python = require("tree-sitter-python/grammar");

module.exports = grammar(python, {
  name: "ipython",

  rules: {
    // Extend _simple_statement to include magics and shell escapes
    // Cell magic must come before line_magic to match %% before %
    _simple_statement: ($, original) => choice(
      original,
      $.cell_magic,
      $.line_magic,
      $.shell_escape,
    ),

    // Cell magic: %%command [arguments]
    // Must be first line of cell - but we can't enforce that in grammar
    cell_magic: $ => seq(
      alias('%%', $.cell_magic_operator),
      field('name', $.magic_name),
      optional(field('arguments', $.magic_arguments)),
    ),

    // Line magic: %command [arguments]
    // Examples: %matplotlib inline, %timeit x = 1, %pwd
    line_magic: $ => seq(
      alias('%', $.magic_operator),
      field('name', $.magic_name),
      optional(field('arguments', $.magic_arguments)),
    ),

    // Shell escape: !command
    // Examples: !pip install pandas, !ls -la
    shell_escape: $ => seq(
      alias('!', $.shell_operator),
      field('command', $.shell_content),
    ),

    // Magic command name (alphanumeric + underscore, can have ? or ?? suffix for help)
    magic_name: $ => /[a-zA-Z_][a-zA-Z0-9_]*\??/,

    // Magic arguments (rest of line after command name)
    magic_arguments: $ => /[^\r\n]+/,

    // Shell command content (rest of line after !)
    shell_content: $ => /[^\r\n]+/,
  },
});
