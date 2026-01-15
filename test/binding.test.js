const assert = require("node:assert");
const { test, describe } = require("node:test");

describe("tree-sitter-ipython binding", () => {
  let Parser;
  let IPython;

  test("loads tree-sitter package", () => {
    Parser = require("tree-sitter");
    assert.ok(Parser, "tree-sitter should be importable");
  });

  test("loads tree-sitter-ipython binding", () => {
    IPython = require("..");
    assert.ok(IPython, "tree-sitter-ipython should be importable");
  });

  test("exports language name", () => {
    assert.strictEqual(
      IPython.name,
      "ipython",
      'should export name as "ipython"',
    );
  });

  test("exports language object (not function)", () => {
    assert.strictEqual(
      typeof IPython.language,
      "object",
      "language should be an object, not a function",
    );
    assert.notStrictEqual(
      typeof IPython.language,
      "function",
      "language should NOT be a function",
    );
  });

  test("parser accepts language without error", () => {
    const parser = new Parser();
    // This is the critical test - setLanguage throws "Invalid language object"
    // if the binding doesn't use TypeTag correctly
    assert.doesNotThrow(() => {
      parser.setLanguage(IPython);
    }, "parser.setLanguage should not throw");
  });

  test("parses simple Python code", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree = parser.parse("x = 1");
    assert.ok(tree, "should return a tree");
    assert.ok(tree.rootNode, "tree should have rootNode");
    assert.strictEqual(tree.rootNode.type, "module", "root should be module");
    assert.ok(!tree.rootNode.hasError, "should not have parse errors");
  });

  test("parses line magic", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree = parser.parse("%matplotlib inline");
    const root = tree.rootNode;

    assert.strictEqual(root.type, "module");
    assert.ok(!root.hasError, "should not have parse errors");

    const lineMagic = root.firstChild;
    assert.strictEqual(
      lineMagic.type,
      "line_magic",
      "should parse as line_magic",
    );

    const nameNode = lineMagic.childForFieldName("name");
    assert.ok(nameNode, "should have name field");
    assert.strictEqual(
      nameNode.text,
      "matplotlib",
      'magic name should be "matplotlib"',
    );

    const argsNode = lineMagic.childForFieldName("arguments");
    assert.ok(argsNode, "should have arguments field");
    assert.strictEqual(
      argsNode.text,
      "inline",
      'arguments should be "inline" without leading space',
    );
  });

  test("parses cell magic", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree = parser.parse("%%time\nx = sum(range(1000))");
    const root = tree.rootNode;

    assert.ok(!root.hasError, "should not have parse errors");

    const cellMagic = root.firstChild;
    assert.strictEqual(
      cellMagic.type,
      "cell_magic",
      "should parse as cell_magic",
    );

    const nameNode = cellMagic.childForFieldName("name");
    assert.ok(nameNode, "should have name field");
    assert.strictEqual(nameNode.text, "time", 'magic name should be "time"');
  });

  test("parses shell escape", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree = parser.parse("!pip install pandas");
    const root = tree.rootNode;

    assert.ok(!root.hasError, "should not have parse errors");

    const shellEscape = root.firstChild;
    assert.strictEqual(
      shellEscape.type,
      "shell_escape",
      "should parse as shell_escape",
    );

    const commandNode = shellEscape.childForFieldName("command");
    assert.ok(commandNode, "should have command field");
    assert.strictEqual(
      commandNode.text,
      "pip install pandas",
      'command should be "pip install pandas"',
    );
  });

  test("parses mixed IPython and Python code", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const code = `%matplotlib inline
import pandas as pd
!pip install numpy
%%time
x = sum(range(1000))
`;

    const tree = parser.parse(code);
    const root = tree.rootNode;

    assert.ok(!root.hasError, "should not have parse errors");

    const children = root.children.filter((c) => c.isNamed);
    assert.ok(children.length >= 4, "should have at least 4 statements");

    assert.strictEqual(
      children[0].type,
      "line_magic",
      "first should be line_magic",
    );
    assert.strictEqual(
      children[1].type,
      "import_statement",
      "second should be import_statement",
    );
    assert.strictEqual(
      children[2].type,
      "shell_escape",
      "third should be shell_escape",
    );
    assert.strictEqual(
      children[3].type,
      "cell_magic",
      "fourth should be cell_magic",
    );
  });

  test("parses shell escape inside indented block", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const code = `for i in range(3):
    !echo $i`;

    const tree = parser.parse(code);
    const root = tree.rootNode;

    assert.ok(!root.hasError, "should not have parse errors");

    const forStmt = root.firstChild;
    assert.strictEqual(
      forStmt.type,
      "for_statement",
      "should be for_statement",
    );

    // Find the shell_escape inside the block
    const block = forStmt.childForFieldName("body");
    assert.ok(block, "should have body block");

    const shellEscape = block.firstNamedChild;
    assert.strictEqual(
      shellEscape.type,
      "shell_escape",
      "should have shell_escape in block",
    );

    const commandNode = shellEscape.childForFieldName("command");
    assert.strictEqual(
      commandNode.text,
      "echo $i",
      'command should be "echo $i"',
    );
  });

  test("handles incremental parsing", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree1 = parser.parse("x = 1");
    const tree2 = parser.parse("x = 2", tree1);

    assert.ok(tree2, "incremental parse should return a tree");
    assert.ok(!tree2.rootNode.hasError, "should not have parse errors");
  });

  test("query works on parsed tree", () => {
    const parser = new Parser();
    parser.setLanguage(IPython);

    const tree = parser.parse("%timeit x = 1");
    const query = new Parser.Query(
      IPython,
      "(line_magic name: (magic_name) @name)",
    );
    const matches = query.matches(tree.rootNode);

    assert.ok(matches.length > 0, "should have matches");
    assert.strictEqual(
      matches[0].captures[0].node.text,
      "timeit",
      "should capture magic name",
    );
  });
});
