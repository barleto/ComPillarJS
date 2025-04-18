enum TokenType {
    EOF,
    LITERAL,
    IGNORE_RULE,
    OR,
    ARROW,
    RULE,
    LEFT_PAREN,
    RIGHT_PAREN,
    PLUS,
    STAR,
    SEMI_COL,
    ONE_LINE_COMM,
    MULTI_LINE_COMM
}

function isComment(type: TokenType): Boolean {
    return type == TokenType.ONE_LINE_COMM || type == TokenType.MULTI_LINE_COMM;
}

class ScanMatchResult {
    isMatch: boolean;
    value: string;
    type: TokenType;
    start: number;
    end: number;

    constructor(isMatch: boolean, value: string, type: TokenType = TokenType.LITERAL, start: number = 0, end: number = 0) {
        this.isMatch = isMatch;
        this.value = value;
        this.type = type;
        this.start = start;
        this.end = end;
    }

    length(): number {
        return this.end - this.start;
    }
}

class TokenDefinition {

    _type: TokenType;
    _pattern: RegExp;

    constructor(pattern: RegExp, type: TokenType) {
        this._pattern = pattern;
        this._type = type;
    }

    isMatch(input: string, startIndex: number): ScanMatchResult {
        this._pattern.lastIndex = startIndex;
        const result = this._pattern.exec(input);
        //console.log(`Try[${this._pattern.lastIndex}]: ${this._pattern}, ${input[0]}, ${result}`);
        if (!result) {
            return new ScanMatchResult(false, "");
        }
        return new ScanMatchResult(true, result[0], this._type, result.index, result.index + result[0].length);
    }
}

class Token {
    type: TokenType;
    value: String;
    lineno: number;
    startPos: number;
    constructor(type: TokenType, value: String, lineno: number, startPos: number) {
        this.type = type;
        this.value = value;
        this.lineno = lineno;
        this.startPos = startPos;
    }

    toString(): string {
        return `${TokenType[this.type]}[${this.lineno},${this.startPos},${this.value.length}] = ${this.value}`
    }
}

function isWhiteSpace(char: string): boolean {
    return /^\s$/.test(char);
}

function countNewlines(str: string): number {
    return str.split('\n').length - 1;
  }

class Lexer {
    private _input: string;
    private _lineno = 1;
    private _lineCharCount = 0;
    private _inputPointer = 0
    private readonly _definitions: TokenDefinition[] = [];

    constructor(input: string) {
        this._input = input;
        //https://stackoverflow.com/questions/2498635/java-regex-for-matching-quoted-string-with-escaped-quotes
        this._definitions.push(new TokenDefinition(/\"(?:[\\\\]\"|[^\"])*\"/g, TokenType.LITERAL));
        this._definitions.push(new TokenDefinition(/<[_a-zA-z][-_a-zA-z0-9]*>/g, TokenType.RULE));
        this._definitions.push(new TokenDefinition(/::=/g, TokenType.ARROW));
        this._definitions.push(new TokenDefinition(/[|]/g, TokenType.OR));
        this._definitions.push(new TokenDefinition(/[(]/g, TokenType.LEFT_PAREN));
        this._definitions.push(new TokenDefinition(/[)]/g, TokenType.RIGHT_PAREN));
        this._definitions.push(new TokenDefinition(/[+]/g, TokenType.PLUS));
        this._definitions.push(new TokenDefinition(/[*]/g, TokenType.STAR));
        this._definitions.push(new TokenDefinition(/IGNORE/g, TokenType.IGNORE_RULE));
        this._definitions.push(new TokenDefinition(/;/g, TokenType.SEMI_COL));
        this._definitions.push(new TokenDefinition(/\/\/.*(?=\n)/g, TokenType.ONE_LINE_COMM));
        this._definitions.push(new TokenDefinition(/[\/][*][\\s\\S]*?[*][\/]/g, TokenType.MULTI_LINE_COMM));
    }

    getTokens(): Token[] {
        const result: Token[] = [];
        let token: Token = new Token(TokenType.EOF, "", 0, 0);
        do {
            token = this.getToken();
            result.push(token);
        } while (token.type != TokenType.EOF);
        return result;
    }

    private getToken(): Token {
        while (this._inputPointer < this._input.length) {
            const match: ScanMatchResult = this.scan()
            if (match.isMatch && match.start == this._inputPointer) {
                this._inputPointer = match.end;
                var start = this._lineCharCount;
                this._lineCharCount += match.value.length;
                this._lineno += countNewlines(match.value);
                const t =  new Token(match.type, match.value, this._lineno, start);
                return t;
            } else {
                if (this._input[this._inputPointer] == '\n') {
                    this._lineno += 1
                    this._lineCharCount = 0;
                    this._inputPointer += 1
                    continue
                } else if(isWhiteSpace(this._input[this._inputPointer])) {
                    this._inputPointer += 1;
                    this._lineCharCount += 1;
                    continue;
                }
                console.log(input.substring(this._inputPointer));
                throw new Error(`Unidentified character '${this._input[this._inputPointer]}' at [${this._lineno},${this._lineCharCount}]`);
            }
        }
        return new Token(TokenType.EOF, "", this._lineno, this._lineCharCount)
    }

    scan(): ScanMatchResult {
        for (const tokDef of this._definitions) {
            const matchRes = tokDef.isMatch(this._input, this._inputPointer)
            if (matchRes.isMatch && matchRes.start == this._inputPointer) {
                return matchRes
            }
        }
        return new ScanMatchResult(false, "");
    }
}

var input = `
    IGNORE ::= "COmment??" | "multilined comment";
    //"single line comm"
    /*possible multi-
    -lined comm!*/
    <RULE> ::= <NON-TERM> ("lala\n+*\\()" | "AAA"| <ziriguidum>+)*;
    `;
const lexer = new Lexer(input);
const tokens = lexer.getTokens();
for(const t of tokens) {
    console.log(t.toString());
}
