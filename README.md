# NuDB
## Install
**Must install Node.js and NUDB**  
Then install node module for nudb:  
```bash
$ npm install node-nudb
```

## Usage
### 資料格式說明
+ GAIS record: 以"@"開頭, ":"結尾
```
Example:
	@title:
```
+ JSON

### Connect to NuDB
```js
let node_nudb = require('node-nudb');
let nudb = new node_nudb.Nudb();
nudb.connect('host', 'port', 'db');
```

### Search
```js
let query = {
	db: "test",
	matchmode: "BestMatch",
	groupby: "@title:",
	getrec: 'y',
	orderby: "score",
	order: "decreasing",
	minrid: 100,
	maxrid: 10000,
	ridrange: 10000,
	minscore: 100,
	maxscore: 5000,
	q: "旅遊",
	filter: "@viewcount:>1000",
	Sensitivity: "sensitive",
	p: 1,
	ps: 10,
	select: "@title:,@body:,@viewcount:",
	out: "json"
}
let result = await nudb.search(query);
```

##### 參數說明
+ db: 指定DB
+ matchmode
	+ AndMatch (預設)
	+ OrMatch
	+ BestMatch
+ groupby: 指定欄位群組, 預設只有輸出key, count, 欄位格式為GAIS record
+ getrec=y: 搭配groupby使用, 輸出全部資料
+ orderby
	+ rid: 依照rid排序
	+ score: 必須有參數q 才有score
	+ groupsize: 搭配groupby
	+ {FieldName}: 依照欄位(FieldName)排序, 在建立DB時須將要排序的欄位加至abstractindex 
		```js
		{ 
			orderby: '@viewcount:' 
		}
		```
	+ [min|max|ave|sum]{FieldName}: 找出欄位(FieldName)的最小/最大/平均/總和值  
		```js
		{ 
			orderby: 'sum@viewcount:' 
		}
		```
+ order: 搭配orderby使用, 預設為decreasing
	+ decreasing: 遞減
	+ increasing: 遞增
+ minrid: 設定rid最小值
+ maxrid: 設定rid最大值
+ ridrange: 設定搜尋的rid範圍, rid由大至小, 僅搜尋此範圍內的資料
+ minscore: score最小值
+ maxscore: score最大值
+ q: 搜尋關鍵字, 可指定欄位搜尋, 欄位格式為GAIS record
	+ 指定欄位搜尋: 
	```js
	{
		q: '@title:日本旅遊'
	}
	```
+ filter: 數值條件檢索, 沒有做數值欄位索引(-numfieldindex)也可查詢
	```js
	{
		filter: '@price:<200'		
	}	
	```
	```js
	{
		@price:200-400		//數值區間
	}
	```
+ maxcandidnum
+ Sensitivity
	+ sensitive: 預設, 區分大小寫
	+ insensitive: 不分大小寫
+ keytermfield
+ keytermstat
+ p: page, 指定輸出page, 預設為1
+ ps: page size, 每個page大小, 預設為10
+ select: 指定輸出欄位, 欄位格式為GAIS record, 多個欄位之間以","區隔
+ L: 指定回傳起始比數及總筆數
	```js
	{
		L: 30		//回傳30筆
	}
	```
	```js
	{
		L: 11,60	//從第11筆開始, 輸出60筆
	}
	```
+ out: 輸出格式 (json or text)

### Get record by rid
```js
let result = await nudb.rget(rid);
```

### Put record
```js
let result = await nudb.rput(data, format, recBeg);
```
##### 參數說明
+ data: 資料
+ format: 資料格式(json or text)
+ recBeg: record begin pattern, 若資料格式為text則必須有此參數

### Put record from file
```js
let result = await nudb.fput(file, format, recBeg);
```
##### 參數說明
+ file: 要上傳的資料
+ format: 資料格式(json or text)
+ recBeg: record begin pattern, 若資料格式為text則必須有此參數

### Delete record by rid
```js
let result = await nudb.rdel(rid);
```

### Update record
```js
let result = await nudb.rupdate(rid, data, format);
```
##### 參數說明
+ rid: 要更新的資料rid
+ data: 更新的資料內容
+ format: 資料格式(json or text)