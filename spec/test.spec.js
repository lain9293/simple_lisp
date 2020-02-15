var t = require('../simple_lisp').simpleLisp;

var is = function (input, type) {
  return Object.prototype.toString.call(input) === '[object ' + type + ']';
};

// takes an AST and replaces type annotated nodes with raw values
var unannotate = function (input) {
  if (is(input, 'Array')) {
    if (input[0] === undefined) {
      return [];
    } else if (is(input[0], 'Array')) {
      return [unannotate(input[0])].concat(unannotate(input.slice(1)));
    } else {
      return unannotate(input[0]).concat(unannotate(input.slice(1)));
    }
  } else {
    return [input.value];
  }
};

describe('simpleLisp', function () {
  describe('parse', function () {
    it('should lex a single atom', function () {
      expect(t.parse("a").value).toEqual("a");
    });

    it('should lex an atom in a list', function () {
      expect(unannotate(t.parse("()"))).toEqual([]);
    });

    it('should lex multi atom list', function () {
      expect(unannotate(t.parse("(hi you)"))).toEqual(["hi", "you"]);
    });

    it('should lex list containing list', function () {
      expect(unannotate(t.parse("((x))"))).toEqual([
        ["x"]
      ]);
    });

    it('should lex list containing list', function () {
      expect(unannotate(t.parse("(x (x))"))).toEqual(["x", ["x"]]);
    });

    it('should lex list containing list', function () {
      expect(unannotate(t.parse("(x y)"))).toEqual(["x", "y"]);
    });

    it('should lex list containing list', function () {
      expect(unannotate(t.parse("(x (y) z)"))).toEqual(["x", ["y"], "z"]);
    });

    it('should lex list containing list', function () {
      expect(unannotate(t.parse("(x (y) (a b c))"))).toEqual(["x", ["y"],
        ["a", "b", "c"]
      ]);
    });

    describe('atoms', function () {
      it('should parse out numbers', function () {
        expect(unannotate(t.parse("(1 (a 2))"))).toEqual([1, ["a", 2]]);
      });
    });
  });

  describe('execute', function () {
    describe('lists', function () {
      it('should return empty list', function () {
        expect(t.execute('()')).toEqual([]);
      });

      it('should return list of strings', function () {
        expect(t.execute('("hi" "mary" "rose")')).toEqual(['hi', "mary", "rose"]);
      });

      it('should return list of numbers', function () {
        expect(t.execute('(1 2 3)')).toEqual([1, 2, 3]);
      });

      it('should return list of numbers in strings as strings', function () {
        expect(t.execute('("1" "2" "3")')).toEqual(["1", "2", "3"]);
      });
    });

    describe('atoms', function () {
      it('should return string atom', function () {
        expect(t.execute('"a"')).toEqual("a");
      });

      it('should return string with space atom', function () {
        expect(t.execute('"a b"')).toEqual("a b");
      });

      it('should return string with opening paren', function () {
        expect(t.execute('"(a"')).toEqual("(a");
      });

      it('should return string with closing paren', function () {
        expect(t.execute('")a"')).toEqual(")a");
      });

      it('should return string with parens', function () {
        expect(t.execute('"(a)"')).toEqual("(a)");
      });

      it('should return number atom', function () {
        expect(t.execute('123')).toEqual(123);
      });
    });

    describe('invocation', function () {
      it('should run print on an int', function () {
        expect(t.execute("(print 1)")).toEqual(1);
      });

      it('should run print on an int', function () {
        expect(t.execute("(print 2 3)")).toEqual(2);
      });
      it('should run print on an int', function () {
        expect(t.execute("(print (2 3))")).toEqual([2, 3]);
      });

      it('should return first element of list', function () {
        expect(t.execute("(car (1 2 3))")).toEqual(1);
      });

      it('should return first element of list', function () {
        expect(t.execute("(car (1))")).toEqual(1);
      });

      it('should return first element of list', function () {
        expect(t.execute("(car ())")).toEqual([]);
      });

      it('should return first element of list', function () {
        expect(t.execute("(car ((1 2 3) (1 2 3) (1 2 3)))")).toEqual([1, 2, 3]);
      });

      it('should return rest of list', function () {
        expect(t.execute("(cdr (1 2 3))")).toEqual([2, 3]);
      });

      it('should return rest of list', function () {
        expect(t.execute("(cdr (1))")).toEqual([]);
      });

      it('should return concat of lists', function () {
        expect(t.execute("(cons (1 2 3) (4 5 6))")).toEqual([1, 2, 3, 4, 5, 6]);
      });

      it('should return concat of lists', function () {
        expect(t.execute("(cons (1 2 3) (4))")).toEqual([1, 2, 3, 4]);
      });

      it('should return concat of lists', function () {
        expect(t.execute("(cons (1 2 3) ())")).toEqual([1, 2, 3]);
      });

      it('should return concat of lists', function () {
        expect(t.execute("(cons () ())")).toEqual([]);
      });

    });

  });
});