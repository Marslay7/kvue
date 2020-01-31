// 数组响应式
// 替换数组原型中的7个方法
const orginalProto = Array.prototype;
// 对orginalProto进行备份处理,修改备份
const arrayProto = Object.create(orginalProto);
// ['push','pop','shirt','unshirt','splice','sort','reverse']
["push", "pop", "shirt", "unshirt", "splice", "sort", "reverse"].forEach(
  method => {
    arrayProto[method] = function() {
      // 原始操作
      orginalProto[method].apply(this, arguments);
      // 覆盖,通知更新
      console.log("数组执行" + method + "操作");
    };
  }
);

// 对象响应式
function defineReactive(obj, key, val) {
  // 递归,如果传入的val是obj,会继续遍历，如果不是会直接return
  observe(val);

  // 对传入的obj进行访问拦截
  Object.defineProperty(obj, key, {
    get() {
      console.log("get " + key);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set " + key + ":" + newVal);
        // 如果传入的newVal依然是obj,需要做响应化处理
        observe(newVal);
        val = newVal;
      }
    }
  });
}

function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    // 希望传入的是obj,如果不是，直接终止
    return;
  }

  // 判断传入的obj类型
  if (Array.isArray(obj)) {
    // 设置实例的原型,覆盖原型，替换7个变更操作
    obj.__proto__ = arrayProto;
    // 对数组内部元素执行响应化
    const keys = Object.keys(obj);
    // 对数组内部元素再执行递归，执行响应式操作
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  } else {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key]);
    });
  }
}

function set(obj, key, val) {
  defineReactive(obj, key, val);
}

// defineReactive(obj, "foo", "foo");
// obj.foo;
// obj.foo = "foooooooooooo";

const obj = { foo: "foo", bar: "bar", baz: { a: 1 }, arr: [1, 2, 3] };

// 遍历obj对象，做响应化处理
observe(obj);

obj.baz = { a: 100 };
obj.baz.a = 10000;

// Object.defineProperty对数组无效
// 分析：改变数组的方法只有7个
// 解决方案：替换数组实例的原型方法，让它们在修改数组的同时通知更新
obj.arr.push(4);
