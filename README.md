# ComPillarJS
Study and implementation of LL(1) parser in TypeScript

A wordplay wih Compiler and Pillar, because this repository was made to study the pillars of compilation and parsing.

BNF in BNF:
```
<language> ::= <rule>*;
<rule> ::= <non-term> "::=" <prod>;
<prod> ::= <expr>+";";
<expr> ::= <operand> ("|" <operand>)*;
<operand> ::= <term>+ ("+"|"*"|"?")?;
<term> ::= <ruleName> | <literal> | "(" <expr> ")";

<ruleName> ::= "<[_a-zA-z][-_a-zA-z0-9]*>";
<literal> ::= "\"(?:[\\]\"|[^\"])*\"";
```