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
- db: DB 名稱
  
### Get DB info

```js
// Example 1
const options = {
  out: 'json',
  timeout: 10000
};
const result1 = await nudb.getDBInfo(db, options);

// Example 2
const result2 = await nudb.getDBInfo({
  db,
  out: 'json',
  timeout: 10000
});
```

**參數說明**  
  
- db: DB 名稱
- options
  - out: 輸出格式(`json` or `text`)，預設是 json.
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
  time: "20190101-20190310",
  pat: "",
  filter: "@viewcount:>1000",
  onlyfield: "@title:",
  Sensitivity: "sensitive",
  keytermstat: 12,
  p: 1,
  ps: 10,
  fastquery: "ON",
  transform: "ON",
  highlight: "title,body,description;<hl>,</hl>,512",
  select: "@title:,@body:,@viewcount:",
  out: "json"
}
const result = await nudb.search(query, timeout);
```

**參數說明**  
  
- timeout: 設定 timeout，單位為 ms，預設是 10000 ms.
- query: query 參數
  - db: DB 名稱
  - matchmode
    - AndMatch (預設)
    - OrMatch
    - BestMatch
  - groupby: 指定欄位群組，預設只有輸出 key & count, 欄位格式為 GAIS record
  - getrec: 是否輸出全部資料(`y` or `n`)，搭配 `groupby` 使用
  - orderby
    - rid: 依照 `rid` 排序
    - score: 必須有參數 `q` 才有 score
    - groupsize: 搭配 `groupby`
    - `{FieldName}`: 依照指定欄位(FieldName)排序
      - 在建立 DB 時, 數值欄位須設定 `-numfieldindex`
      - 在建立 DB 時, 時間欄位須設定 `-timeindex`

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

  - order: 搭配 `orderby` 使用, 預設為 decreasing
    - decreasing: 遞減
    - increasing: 遞增
  - minrid: 設定 rid 最小值
  - maxrid: 設定 rid 最大值
  - ridrange: 設定搜尋的 rid 範圍，rid 由大至小，僅搜尋此範圍內的資料
  - minscore: score 最小值
  - maxscore: score 最大值
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

    - 可過濾指定條件: (需有其他條件, 此功能才有作用)

      ```js
      {
        q: 'apple,-@from_board:=test'
      }
      ```

    - 可搜尋多個欄位, 以","區隔:

      ```js
      {
        q: "@title:日本旅遊,@body:東京"
      }
      ```

  - time: 可設定搜尋時間範圍
    - 在建立 DB 時, 時間欄位須設定 `-timeindex`
    - 支援多個時間欄位索引
    - 可指定時間欄位查詢，若未指定欄位，預設使用第一個時間索引的欄位作為查詢
    - 限定時間區間

      ```js
      {
        time: '20180101-20180301'
      }
      ```

      ```js
      {
        time: '@post_time:20180101-20180301'
      }
      ```

    - 特定時間以後
  
      ```js
      {
        time: '>20180220122000'  // YYYYMMDDHHmmss
      }
      ```

    - 特定時間以前

      ```js
      {
        time: '<20180220122000'  // YYYYMMDDHHmmss
      }
      ```

    - 限定某天

      ```js
      {
        time: '20180220'
      }
      ```

  - pat: 必須含有指定 pattern
    - 搜尋結果中, 必須含有 "apple" pattern

    ```js
    {
      pat: 'apple'
    }
    ```

    - 指定欄位必須含有 pattern

    ```js
    {
      pat: '@title:apple'
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

  - onlyfield: 過濾欄位值有重複的資料
    - Ex. 過濾重複 title 的資料

      ```js
      {
        onlyfield: '@title:'
      }
      ```

  - maxcandidnum
  - Sensitivity
    - sensitive: 預設, 區分大小寫
    - insensitive: 不分大小寫
  - keytermfield
  - keytermstat: 回傳指定數量的熱門 keyterm
  - p: page, 指定輸出 page, 預設為 1
  - ps: page size, 每個 page 大小, 預設為 10
  - fastquery: 快速查詢(`ON` or `OFF`)
  - transform: 展開分類詞(`ON` or `OFF`)
  - highlight: highlight 關鍵字
    - 可自訂 highlight 欄位、HTML 標籤、輸出長度...等
    - 語法: `fields`;`prefix html tag`,`postfix html tag`,`output size`, `max segmentation number`
    - 預設: `*;<B>,</B>,256,1`
    - Example:

      ```js
      {
        highlight: 'title,body;<hl>,</hl>,512'
      }
      ```

  - select: 指定輸出欄位, 欄位格式為GAIS record, 多個欄位之間以","區隔
  - out: 輸出格式(`json` or `text`)

### Get record by rid or key

```js
// Example 1
const options = {
  searchField: 'rid',
  out: 'json',
  timeout: 10000
};
const result1 = await nudb.rget(id, options);

// Example 2
const result2 = await nudb.rget({
  id,
  searchField: 'rid',
  out: 'json',
  timeout: 10000
});
```

**參數說明**  
  
- id: Record ID 或 primary key.
- options
  - searchField: 搜尋的欄位(`rid` or `key`)，預設是 rid.
  - out: 輸出格式(`json` or `text`)，預設是 json.
  - timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Put record

```js
// Example 1
const options = {
  operation: 'rupdate',
  recbeg: '@Gais_REC:',
  out: 'json',
  timeout: 10000
};
const result1 = await nudb.rput(data, format, options);

// Example 2
const result2 = await nudb.rput({
  data,
  format,
  operation: 'rupdate',
  recbeg: '@Gais_REC:',
  out: 'json',
  timeout: 10000
});

```

**參數說明**  
  
- data: data object or string.
- format: 資料格式 (`json` or `text`)
- options
  - operation: 當資料存在時, 執行的動作 (`iupdate`, `rupdate` or `error`)
  - recbeg: record begin pattern, 若資料格式為 text 則必須有此參數
  - out: 輸出格式 (`json` or `text`)，預設是 json.
  - timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Put record from file

```js
// Example 1
const options = {
  recbeg: '@Gais_REC:',
  out: 'json',
  timeout: 120000
};
const result1 = await nudb.fput(file, format, options);

// Example 2
const result2 = await nudb.fput({
  file,
  format,
  recbeg: '@Gais_REC:',
  out: 'json',
  timeout: 120000
});
```

**參數說明**  
  
- file: 要上傳的檔案
- format: 資料格式(`json` or `text`)
- options
  - recbeg: record begin pattern, 若資料格式為 text 則必須有此參數
  - out: 輸出格式 (`json` or `text`)，預設是 json.
  - timeout: 設定 timeout，單位為 ms，預設是 120000 ms.

### Delete record by rid or key

```js
// Example 1
const options = {
  searchField: 'rid',
  out: 'json',
  timeout: 10000
};
const result1 = await nudb.rdel(id, options);

// Example 2
const result2 = await nudb.rdel({
  id,
  searchField: 'rid',
  out: 'json',
  timeout: 10000
});
```

**參數說明**  
  
- id: Record ID 或 primary key, 一次刪除多筆可使用`,`區隔多個 id
- options
  - searchField: 搜尋的欄位(`rid` or `key`)，預設是 rid.
  - out: 輸出格式(`json` or `text`)，預設是 json.
  - timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

### Update record

```js
// Example 1
const options = {
  searchField: 'rid',
  updateMethod: 'replaceRecord',
  out: 'json',
  timeout: 10000
};
const result = await nudb.rupdate(id, data, format, options);

// Example 2
const result = await nudb.rupdate({
  id,
  data,
  format,
  searchField: 'rid',
  updateMethod: 'replaceRecord',
  out: 'json',
  timeout: 10000
});
```

**參數說明**  
  
- id: 要更新的資料 rid 或 primary key
- data: 更新的資料內容
- format: 資料格式(`json` or `text`)
- options
  - searchField: 搜尋的欄位(`rid` or `key`)，預設是 rid.
  - updateMethod: 更新方式(`replaceRecord` or `replaceField`)
    - replaceRecord: 取代整筆資料 (Default)
    - replaceField: 取代指定欄位的資料
  - out: 輸出格式(`json` or `text`)，預設是 json.
  - timeout: 設定 timeout，單位為 ms，預設是 10000 ms.

## [Change log](/CHANGELOG.md)