# mysql-mapper

- [Introduction](#introduction)
- [Queryfile](#queryfile)
- [Comment](#comment)
- [SampleAPI](#sampleapi)
- [List](#list)


## Introduction

0.0.1 beta version

this project is sample project and real library folder is **user_modules/sanghwa/mysql-mapper**


This is a node.js driver for mysql + pool + transaction + mapper pattern.
it has very easy usage and powerful.
this library updates continuously.

Here is an example on how to use it:

```js
var mysql      = require('mysql');
pool      =    mysql.createPool({
    connectionLimit : config.connectionLimit, //important
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.database,
    debug    :  config.debug
});

var mysqlMapper= require('./user_modules/sanghwa/mysql-mapper');
mysqlMapper.setPool(pool);
mysqlMapper.setPath("query");  // folder path of queries.
mysqlMapper.parsingStart(['test']); // query files arrays



... router.js
var taskM = require('.task');
var executeManager = require('.execute-manager');


router.get('/query/test', function(req, res, next) {
  var taskContext= taskM.makeTasks();
  var field = {'content': 'yaho'};

  taskContext.tasks.push(taskM.getTask('test.insert_tb_board', field, function(result){}));
  taskContext.tasks.push(taskM.getTask('test.insert_tb_board_reply', field, function(result){
    console.log('lastInsertId : ' + result.insertId);
    for(var i=0; i<4; i++){
      taskContext.tasks.unshift(taskM.getTask('test.insert_tb_board', field)); //  
    }
  }));
  taskContext.tasks.push(taskM.getTask('test.select_tb_board_reply', field, function(result){}));


  executeManager.start(res, taskContext, true);
});

```

## Queryfile

this show how to write querys

- `{cate:id} query {/}` - this tag is categoryname and id of query, start and end of query
- `[name][/]`           - if it exist. check if variable name is null
- `#name`               - variable data of name is into #name 

```
{test:insert_tb_board}
	INSERT INTO `node`.`tb_board`
		(CONTENT)
	VALUES
		('#content')
{/}

{test:insert_tb_board_reply}
	INSERT INTO `node`.`tb_board_reply`
		(`CONTENT`,  `BOARD_SEQ`)
	VALUES
		('data2', 6)
{/}

{test:select_tb_board_reply}
	select * from  tb_board
	where
		1=1
	[content]
		and content = '#content'
	[/]
	[board_seq]
       	and board_seq = '#board_seq'
	[/]
	limit 0, 100
{/}

{test:select_sleep}
	select sleep(10)
{/}


```

## Comment

like javascript 
this library provide comments start with //

``` 
// in query files

// this is line comment
{test:select_sleep}
	select sleep(10)
{/}
```
## NullCheck and DataBind
null check tag is very easy 
ex) [{name}]  query  [/]

``` 
// in query files

select * from tb_user
where user_is ='id'
[user_name]
  and user_name ='#user_name'
[/]
```


## List
this provide list type (array)
First @varibale name, Second @Seperator

```sql 
select * from tb_user
where 
user_id in(
[@ids@,]
   user_id ='#user_id'
[/]
)
```

## SampleAPI

it is working by this step in one cycle

- Make TaskQueue
- Make Task
- Start TaskQueue


```js
//make Task Queue
var taskContext= taskM.makeTasks();

// make data field mapped with query (#tag)
var field = {'content': 'yaho'};

// make task
var task = taskM.getTask('test.insert_tb_board', field);

// make task with callback
task = taskM.getTask('test.insert_tb_board', field, function(){
	alert('test.insert_tb_board finished'); 
	// this is called after test.insert_tb_board executed
});

// insert task into queue
taskContext.tasks.push(task);

// start Task Queue with transaction off
executeManager.start(res, tasks, false);

// start Task Queue with transaction on
executeManager.start(res, tasks, true);

```
