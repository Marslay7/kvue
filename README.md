### 手写 vue1.0

#### 理解 Vue 的设计思想

<img src="https://tva1.sinaimg.cn/large/006tNbRwgy1gbfzko45vhj31e30u0dx5.jpg" style="zoom:25%;" />

##### MVVM 框架三要素：数据响应式、模版引擎及其渲染

- 数据响应式：监听数据变化并在视图更新
  - Object.defineProperty() --- vue1~2
  - Proxy --- vue3
- 模版引擎：提供描述视图的模版语法
  - 插值：{{xxx}}
  - 指令：v-bind、v-on、v-model、v-for、v-if
- 渲染：
  - 如何将模版转换为 html
    - 模版 => vdom => dom

##### 数据响应式原理：利用 Object.defineProperty()实现变更检测。

[简单实现][https://github.com/marslay7/kvue/blob/master/01-defprop.js]

[结合视图][https://github.com/marslay7/kvue/blob/master/02-defprop.html]

##### 注：Object.defineProperty()方法对于数组无效，需要做特殊处理解决数组数据响应化。

##### 实现步骤：

- 找到数组原型
- 覆盖那些能够修改数组的更新方法，使其可以通知更新(["push", "pop", "shirt", "unshirt", "splice", "sort", "reverse"])
- 将得到的新的原型设置到数组实例原型上

[具体实现][https://github.com/marslay7/kvue/blob/master/01-defprop.js]

##### Vue 中的数据响应化

<img src="https://tva1.sinaimg.cn/large/006tNbRwgy1gbg0bajzb3j30wk0hiaeq.jpg" style="zoom: 50%;" />

##### 原理分析：

- new MVVM(Vue)首先执行初始化，对 data 执行响应式处理，这个过程发生在 Observer 中
- 同时对模版执行编译，找到其中动态绑定的数据，从 data 中获取并初始化视图，这个过程发生在 Compile 中
- 同时定义一个更新函数 Updater 和观察者 Watcher，将来对应数据变化时 Watcher 会调用更新函数
- 由于 data 的某个 key 在一个视图中可能出现多次，所以每个 key 都需要一个管家 Dep 来管理多个 Watcher
  - 1 个 Dep >= 1 个 Watcher，1 个 Watcher = 1 个 Updater
- 将来 data 中数据一旦发生变化，就会首先找到对应的 Dep，通知所有 Watcher 执行更新函数

##### 涉及类型介绍：

- KVue：框架构造函数
- Observer：执行数据响应化
- Compile：编译模版，初始化视图，收集依赖(更新函数 Updater 和 Watcher 的创建)
- Watcher：执行更新函数(更新 dom)
- Dep：管理多个 Watcher，批量更新有修改的 Watcher

##### 具体实现：

- 数据响应化、Watcher 观察者、Dep 依赖收集、[KVue][https://github.com/marslay7/kvue/blob/master/kvue.js]
- 编译器 Compile、更新函数[Compile][https://github.com/marslay7/kvue/blob/master/compile.js]
- [结合视图][https://github.com/marslay7/kvue/blob/master/kvue.html]

##### 依赖收集：

- 视图中会用到 data 中某个 key(这里的 key 指的是 data 中定义的数据)，这称为依赖。
- 同一个 key(数据)可能出现多次，每次都需要收集出来用一个 Watcher 来维护，此过程称为依赖收集。
- 多个 Watcher 需要一个 Dep 来管理，需要更新时由 Dep 统一通知。

![](https://tva1.sinaimg.cn/large/006tNbRwgy1gbg154f1srj30wc0pewka.jpg)

##### 如上图所示：

###### 3 个 p 标签(3 个依赖) ===> (依赖收集)3 个 Watcher，但是 key 值只有 2 个;所以产生 2 个 Dep 分别管理对应的数据。
