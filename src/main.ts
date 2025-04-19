import { ASTPrinter } from "./ASTPrinter";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";

export let input = `
<language> ::= <rule>*;
<rule> ::= <non-term> "::=" <prod>;
<prod> ::= <expr>+";";
<expr> ::= <operand> ("|" <operand>)*;
<operand> ::= ( <term> ("+"|"*"|"?")? )+;
<term> ::= <ruleName> | <literal> | "(" <expr> ")";

<ruleName> ::= "<[_a-zA-z][-_a-zA-z0-9]*>";
<literal> ::= "\\"(?:[\\]\\"|[^\\"])*\\"";
`;
const lexer = new Lexer(input);
const tokens = lexer.getTokens();
const parser = new Parser(tokens);
const lan = parser.parse();

// const lan = new AST.Language();
// lan.rules.push(new AST.Rule(new AST.NonTerm("LALA"), new AST.ProdList([
//     new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal"), AST.ElemType.TERM)), TokenType.STAR)]),
//     new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal2"), AST.ElemType.TERM)), /*TokenType.STAR*/)]),
// ])));
// lan.rules.push(new AST.Rule(new AST.NonTerm("sug8739")));
// lan.rules.push(new AST.Rule(new AST.NonTerm("__363__asikdhjgf")));

let printer = new ASTPrinter();
printer.log(lan);
