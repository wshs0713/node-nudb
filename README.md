# NUDB

A Node.js module for NUDB.  
NUDB is a fast database and search engine.  

Menu:  

- [NUDB](#nudb)
  - [Install](#install)
  - [Usage](#usage)
    - [資料格式說明](#%e8%b3%87%e6%96%99%e6%a0%bc%e5%bc%8f%e8%aa%aa%e6%98%8e)
    - [Connect to NUDB](#connect-to-nudb)
    - [Get DB info](#get-db-info)
    - [Search](#search)
    - [Get record by rid or key](#get-record-by-rid-or-key)
    - [Put record](#put-record)
    - [Put record from file](#put-record-from-file)
    - [Delete record by rid or key](#delete-record-by-rid-or-key)
    - [Update record](#update-record)
  - [Change log](#change-log)

## Install

```bash
$ npm install node-nudb
```

## Usage

### 資料格式說明

- GAIS record  
  - 以 `@` 開頭, `:` 結尾作為欄位名稱
  - `:` 之後為欄位內容
  - For example:  

    ```js
    // "@title:" 為欄位名稱
    @title:Mayday五月天 [ 頑固Tough ] Official Music Video
    ```
- JSON

### Connect to NUDB

```js
const { Nudb } = require('node-nudb');

const nudb = new Nudb();
nudb.connect(host, port, db);
```

**參數說明**  
  
- host: DB host
- port: DB port
- db: 指定 DB 名稱
  
### Get DB info

```js
const result = await nudb.getDBInfo(db, timeout);
```

**參數說明**  
  
- db: 指定 DB 名稱
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.
  
### Search

```js
const query = {
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
  time: "=20190101-20190310",
  filter: "@viewcount:>1000",
  Sensitivity: "sensitive",
  p: 1,
  ps: 10,
  select: "@title:,@body:,@viewcount:",
  out: "json"
}
const result = await nudb.search(query, timeout);
```

**參數說明**  
  
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.
- query: query 參數
  - db: 指定DB
  - matchmode
    - AndMatch (預設)
    - OrMatch
    - BestMatch
  - groupby: 指定欄位群組, 預設只有輸出key, count, 欄位格式為GAIS record
  - getrec=y: 搭配groupby使用, 輸出全部資料
  - orderby
    - rid: 依照rid排序
    - score: 必須有參數q 才有score
    - groupsize: 搭配groupby
    - {FieldName}: 依照欄位(FieldName)排序
      - 在建立DB時, 數值欄位須設定 `-numfieldindex`
      - 在建立DB時, 時間欄位須設定 `-timeindex`

      ```js
      {
        orderby: '@viewcount:'
      }
      ```

    - [min|max|ave|sum]{FieldName}: 找出欄位(FieldName)的最小/最大/平均/總和值

      ```js
      {
        orderby: 'sum@viewcount:'
      }
      ```

  - order: 搭配orderby使用, 預設為decreasing
    - decreasing: 遞減
    - increasing: 遞增
  - minrid: 設定rid最小值
  - maxrid: 設定rid最大值
  - ridrange: 設定搜尋的rid範圍, rid由大至小, 僅搜尋此範圍內的資料
  - minscore: score最小值
  - maxscore: score最大值
  - q: 搜尋關鍵字
    - 全文搜尋:  

      ```js
      {
        q: '賞櫻旅遊'
      }
      ```

    - 可指定欄位搜尋, 欄位格式為GAIS record:

      ```js
      {
        q: '@title:日本旅遊'
      }
      ```

    - 可指定欄位值須完全符合:

      ```js
      {
        q: '@id:=abcd1234'
      }
      ```

    - 可設定所有條件須符合(AndMatch):

      ```js
      {
        q: '+@id:1234,+@name:test'
      }
      ```

    - 可搜尋多個欄位, 以","區隔:

      ```js
      {
        q: "@title:日本旅遊,@body:東京"
      }
      ```

  - time: 可設定搜尋時間範圍
    - 在建立DB時, 時間欄位須設定 `-timeindex`
    - 限定時間區間

      ```js
      {
        time: '=20180101-20180301'
      }
      ```

    - 特定時間以後
  
      ```js
      {
        time: '=>20180220122000'  // YYYYMMDDHHmmss
      }
      ```

    - 特定時間以前

      ```js
      {
        time: '=<20180220122000'  // YYYYMMDDHHmmss
      }
      ```

    - 限定某天

      ```js
      {
        time: '=20180220'
      }
      ```

  - filter: 數值條件檢索, 沒有做數值欄位索引(-numfieldindex)也可查詢

      ```js
      {
        filter: '@price:<200'
      }
      ```

      ```js
      {
        filter: '@price:200-400'  //數值區間
      }
      ```

  - maxcandidnum
  - Sensitivity
    - sensitive: 預設, 區分大小寫
    - insensitive: 不分大小寫
  - keytermfield
  - keytermstat
  - p: page, 指定輸出page, 預設為1
  - ps: page size, 每個page大小, 預設為10
  - select: 指定輸出欄位, 欄位格式為GAIS record, 多個欄位之間以","區隔
  - L: 指定回傳起始比數及總筆數

    ```js
    {
      L: 30       // 回傳30筆
    }
    ```

    ```js
    {
      L: '11,60'  // 從第11筆開始, 輸出60筆
    }
    ```

  - out: 輸出格式 (json or text)

### Get record by rid or key

```js
const result = await nudb.rget(id, searchField, timeout);
```

**參數說明**  
  
- id: Record ID 或 primary key
- searchField: 搜尋的欄位，rid 或 key, 預設是 rid.
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Put record

```js
const result = await nudb.rput(data, format, recBeg, timeout);
```

**參數說明**  
  
- data: data object or string.
- format: 資料格式(json or text)
- recBeg: record begin pattern, 若資料格式為text則必須有此參數
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Put record from file

```js
const result = await nudb.fput(file, format, recBeg, timeout);
```

**參數說明**  
  
- file: 要上傳的檔案
- format: 資料格式(json or text)
- recBeg: record begin pattern, 若資料格式為text則必須有此參數
- timeout: 設定 timeout，單位為 ms，預設是 120000 ms.

### Delete record by rid or key

```js
const result = await nudb.rdel(id, searchField, timeout);
```

**參數說明**  
  
- id: Record ID 或 primary key, 一次刪除多筆可使用`,`區隔多個 id
- searchField: 搜尋的欄位，rid 或 key, 預設是 rid.
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Update record

```js
const result = await nudb.rupdate(id, data, format, searchField, updateMethod, timeout);
```

**參數說明**  
  
- id: 要更新的資料rid 或 primary key
- data: 更新的資料內容
- format: 資料格式(json or text)
- searchField: 搜尋的欄位，rid 或 key, 預設是 rid.
- updateMethod: 更新方式
  - replaceRecord: 取代整筆資料 (Default)
  - replaceField: 取代指定欄位的資料
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

## [Change log](/CHANGELOG.md)