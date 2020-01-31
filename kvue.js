function defineReactive(obj, key, val) {
  // 递归,如果传入的val是obj,会继续遍历，如果不是会直接return
  observe(val);

  // 创建一个Dep和当前key一一对应
  const dep = new Dep();

  // 对传入的obj进行访问拦截
  Object.defineProperty(obj, key, {
    get() {
      console.log("get " + key);
      // 依赖收集在这里
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set " + key + ":" + newVal);
        // 如果传入的newVal依然是obj,需要做响应化处理
        observe(newVal);
        val = newVal;

        // 更新数据，通知更新
        // watchers.forEach(w => w.update());
        dep.notify();
      }
    }
  });
}

function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    // 希望传入的是obj,如果不是，直接终止
    return;
  }

  // 创建Observer实例
  new Observer(obj);
}

// 代理函数，方便用户直接访问$data中的数据
function proxy(vm, sourceKey) {
  Object.keys(vm[sourceKey]).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[sourceKey][key];
      },
      set(newVal) {
        vm[sourceKey][key] = newVal;
      }
    });
  });
}

// 创建KVue构造函数
class KVue {
  constructor(options) {
    // 保存选项
    this.$options = options;
    this.$data = options.data;

    // 响应化处理
    observe(this.$data);

    // 代理
    proxy(this, "$data");

    // 创建编译器
    new Compile(options.el, this);
  }
}

/**
 * 根据对象的类型来决定如何做响应化
 * 由于Object.defineproperty()对数组无效，
 * 所以得先判断传入的value是obj还是arr,做相应的处理
 */
class Observer {
  constructor(value) {
    this.value = value;

    // 判断其类型
    if (typeof value === "object") {
      this.walk(value);
    }
  }

  // 对象数据的响应化
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key]);
    });
  }

  /**
   * 数组数据的响应化
   * 找到数组原型
   * 覆盖那些能够修改数组的更新方法，使其可以通知更新
   * 将得到的新的原型设置到数组实例的原型上
   */
}

// 创建观察者：保存更新函数，值发生变化调用更新函数
// const watchers = [];
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm;
    this.key = key;
    this.updateFn = updateFn;

    // watchers.push(this);

    // Dep.target静态属性上设置为当前watcher实例
    Dep.target = this;
    this.vm[this.key]; // 读取数据触发了getter
    Dep.target = null; // 收集完就置空
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key]);
  }
}

// Dep:依赖，管理某个key相关的所有Watcher实例
class Dep {
  constructor() {
    this.deps = [];
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  notify() {
    this.deps.forEach(dep => {
      dep.update();
    });
  }
}
