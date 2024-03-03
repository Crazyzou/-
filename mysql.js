var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "9108zoufengjun@Z",
  port: "3306",
  database: "test",
});

connection.connect();

var app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

//加载资源
app.use(express.static("src"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "login.html");
});

app.get("/login.html", function (req, res) {
  var response = {
    username: req.query.username,
    password: req.query.password,
  };

  var selectSQL =
    "select username,password from test where username = '" +
    req.query.username +
    "' and password = '" +
    req.query.password +
    "';";
  connection.query(selectSQL, function (err, result) {
    if (err) {
      res.end("2"); //数据库错误
    }
    if (result == "") {
      res.end("0"); //登录失败
    } else {
      res.end("1"); //登录成功
    }
  });
});

//注册
app.get("/register.html", function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});

var addSql = "INSERT INTO test(username,password) VALUES(?,?)";

app.get("/process", function (req, res) {
  var response = {
    username: req.query.username,
    password: req.query.password,
  };
  var addSqlParams = [req.query.username, req.query.password];
  var selectSQL =
    "select username from test where username = '" + req.query.username + "'";
  connection.query(selectSQL, function (err, result) {
    if (err) {
      console.log("[SELECT ERROR] - ", err.message);
      return;
    }
    if (result.length != 0) {
      res.end("0"); // 用户名已存在
    } else {
      connection.query(addSql, addSqlParams, function (err, result) {
        var post = {
          Username: req.query.username,
          NotificationsEnabled: true,
          Nickname: "管理员",
          Email: "10086@qq.com",
          LanguageSetting: "ch",
          FontChoice: "1",
        };
        var query = connection.query(
          "INSERT INTO Settings SET ?",
          post,
          function (error, results, fields) {
            if (error) throw error;
          }
        );
        res.end("1"); //注册成功
      });
    }
  });
  console.log(response);
});

//发放资源
app.get("/:filename", function (req, res) {
  res.sendFile(__dirname + "/" + req.params.filename);
});

//-------------------获取---------------------------//
// 定义一个通用的GET请求处理函数
function handleGetRequest(query, res, callback) {
  var username = query.username; // 获取用户名参数
  connection.query(
    `SELECT ${callback.field} FROM Settings WHERE Username = ?`,
    [username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ [callback.field]: results[0][callback.field] });
    }
  );
}

// 字体设置
app.get("/api/getFontSize", function (req, res) {
  handleGetRequest(req.query, res, { field: "FontChoice" });
});

// 消息设置
app.get("/api/getMessage", function (req, res) {
  handleGetRequest(req.query, res, { field: "NotificationsEnabled" });
});

// 昵称
app.get("/api/getUserNick", function (req, res) {
  handleGetRequest(req.query, res, { field: "Nickname" });
});

// 邮箱
app.get("/api/getUserEmail", function (req, res) {
  handleGetRequest(req.query, res, { field: "Email" });
});

// 语言切换
app.get("/api/getUserLanguage", function (req, res) {
  handleGetRequest(req.query, res, { field: "LanguageSetting" });
});

//------------------更新------------------------//
app.get("/api/setFontSize", function (req, res) {
  var username = req.query.username;
  var fontSize = req.query.fontSize;

  connection.query(
    "UPDATE Settings SET FontChoice = ? WHERE Username = ?",
    [fontSize, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200);
    }
  );
});

app.get("/api/setMessage", function (req, res) {
  var username = req.query.username;
  var NotificationsEnabled = req.query.NotificationsEnabled;

  connection.query(
    "UPDATE Settings SET NotificationsEnabled = ? WHERE Username = ?",
    [NotificationsEnabled, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200);
    }
  );
});

app.get("/api/setUserNick", function (req, res) {
  var username = req.query.username;
  var nickname = req.query.nickname;

  connection.query(
    "UPDATE Settings SET Nickname = ? WHERE Username = ?",
    [nickname, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200);
    }
  );
});

app.get("/api/setUserEmail", function (req, res) {
  var username = req.query.username;
  var Email = req.query.Email;

  connection.query(
    "UPDATE Settings SET Email = ? WHERE Username = ?",
    [Email, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200);
    }
  );
});

app.get("/api/setUserLanguage", function (req, res) {
  var username = req.query.username;
  var LanguageSetting = req.query.LanguageSetting;

  connection.query(
    "UPDATE Settings SET LanguageSetting = ? WHERE Username = ?",
    [LanguageSetting, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200);
    }
  );
});

//采购申请
app.post("/api/addPurchase", function (req, res) {
  var orderNumber = req.body.orderNumber;
  var orderTime = req.body.orderTime;
  var status = req.body.status;
  var username = req.body.username;

  connection.query(
    "INSERT INTO purchase (订单编号, 订单发起时间, 状态, 用户名) VALUES (?, ?, ?, ?)",
    [orderNumber, orderTime, status, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 插入成功
    }
  );
});

app.post("/api/deletePurchase", function (req, res) {
  var orderNumber = req.body.orderNumber;

  connection.query(
    "DELETE FROM purchase WHERE 订单编号 = ?",
    [orderNumber],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 删除成功
    }
  );
});

app.get("/api/getPurchases", function (req, res) {
  var username = req.query.username; // 获取用户名参数

  connection.query(
    "SELECT * FROM purchase WHERE 用户名 = ?",
    [username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      // 将每一条记录转换为一个对象
      var purchases = results.map(function (row) {
        return {
          OrderNumber: row.订单编号,
          OrderTime: row.订单发起时间,
          Status: row.状态,
          Username: row.用户名,
        };
      });
      res.send({ Purchases: purchases });
    }
  );
});

app.post("/api/updatePurchaseStatus", function (req, res) {
  var orderNumber = req.body.orderNumber; // 从请求体中获取订单编号
  var status = req.body.status; // 从请求体中获取状态
  var username = req.body.username;

  connection.query(
    "UPDATE purchase SET 状态 = ? WHERE 订单编号 = ? AND 用户名 = ?",
    [status, orderNumber, username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ message: "Status updated successfully!" });
    }
  );
});

//资产采购
app.post("/api/addAssetPurchase", function (req, res) {
  var supplier = req.body.supplier;
  var price = req.body.price;
  var quantity = req.body.quantity;
  var deliveryDate = req.body.deliveryDate;
  var status = req.body.status;
  var username = req.body.username;

  connection.query(
    "INSERT INTO Asset_Purchases (Username, Supplier, Price, Quantity, Delivery_Date, Status) VALUES (?, ?, ?, ?, ?, ?)",
    [username, supplier, price, quantity, deliveryDate, status],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 插入成功
    }
  );
});

app.post("/api/deleteAssetPurchase", function (req, res) {
  var supplier = req.body.supplier;
  var username = req.body.username;
  var status = req.body.status;

  connection.query(
    "DELETE FROM Asset_Purchases WHERE Username = ? AND Supplier = ? AND  Status = ?",
    [username, supplier, status],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 删除成功
    }
  );
});

app.get("/api/getAssetPurchases", function (req, res) {
  var username = req.query.username; // 获取用户名参数

  connection.query(
    "SELECT * FROM Asset_Purchases WHERE Username = ?",
    [username],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      // 将每一条记录转换为一个对象
      var assetPurchases = results.map(function (row) {
        return {
          Supplier: row.Supplier,
          Price: row.Price,
          Quantity: row.Quantity,
          Delivery_Date: row.Delivery_Date,
          Status: row.Status,
        };
      });
      res.send({ AssetPurchases: assetPurchases });
    }
  );
});

app.post("/api/updateAssetPurchaseStatus", function (req, res) {
  var username = req.body.username; // 从请求体中获取用户名
  var supplier = req.body.supplier; // 从请求体中获取供应商
  var status = req.body.status; // 从请求体中获取状态

  connection.query(
    "UPDATE Asset_Purchases SET Status = ? WHERE Username = ? AND Supplier = ?",
    [status, username, supplier, status],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ message: "Status updated successfully!" });
    }
  );
});

//资产发放
app.post("/api/addAssetGive", function (req, res) {
  var 编号 = req.body.编号;
  var 名称 = req.body.名称;
  var 购置价格 = req.body.购置价格;
  var 使用人 = req.body.使用人;
  var 发放日期 = req.body.发放日期;
  var 累计折旧 = req.body.累计折旧;
  var 状态 = req.body.状态;
  var 用户名 = req.body.用户名;

  connection.query(
    "INSERT INTO assetGive (编号, 名称, 购置价格, 使用人, 发放日期, 累计折旧, 状态, 用户名) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [编号, 名称, 购置价格, 使用人, 发放日期, 累计折旧, 状态, 用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 插入成功
    }
  );
});

app.post("/api/deleteAssetGive", function (req, res) {
  var 编号 = req.body.编号;

  connection.query(
    "DELETE FROM assetGive WHERE 编号 = ?",
    [编号],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 删除成功
    }
  );
});

app.get("/api/getAssetGive", function (req, res) {
  var 用户名 = req.query.username; // 获取用户名参数
  connection.query(
    "SELECT * FROM assetGive WHERE 用户名 = ?",
    [用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      var infos = results.map(function (row) {
        return {
          编号: row.编号,
          名称: row.名称,
          购置价格: row.购置价格,
          使用人: row.使用人,
          发放日期: row.发放日期,
          累计折旧: row.累计折旧,
          状态: row.状态,
        };
      });
      res.send({ Infos: infos });
    }
  );
});

app.post("/api/updateAssetGiveStatus", function (req, res) {
  var 编号 = req.body.编号; // 从请求体中获取编号
  var 状态 = req.body.状态; // 从请求体中获取状态
  var 用户名 = req.body.用户名;

  connection.query(
    "UPDATE assetGive SET 状态 = ? WHERE 编号 = ? AND 用户名 = ?",
    [状态, 编号, 用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ message: "Status updated successfully!" });
    }
  );
});

//固定资产
app.post("/api/addFixedAsset", function (req, res) {
  var 资产编号 = req.body.资产编号;
  var 资产名称 = req.body.资产名称;
  var 资产类型 = req.body.资产类型;
  var 购买日期 = req.body.购买日期;
  var 购买价格 = req.body.购买价格;
  var 折旧率 = req.body.折旧率;
  var 当前价值 = req.body.当前价值;
  var 位置 = req.body.位置;
  var 状态 = req.body.状态;
  var 用户名 = req.body.用户名;

  connection.query(
    "INSERT INTO fixedAsset (资产编号, 资产名称, 资产类型, 购买日期, 购买价格, 折旧率, 当前价值, 位置, 状态, 用户名) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      资产编号,
      资产名称,
      资产类型,
      购买日期,
      购买价格,
      折旧率,
      当前价值,
      位置,
      状态,
      用户名,
    ],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 插入成功
    }
  );
});

app.post("/api/deleteFixedAsset", function (req, res) {
  var 资产编号 = req.body.资产编号;

  connection.query(
    "DELETE FROM fixedAsset WHERE 资产编号 = ?",
    [资产编号],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 删除成功
    }
  );
});

app.get("/api/getFixedAssets", function (req, res) {
  var 用户名 = req.query.username; // 获取用户名参数
  connection.query(
    "SELECT * FROM fixedAsset WHERE 用户名 = ?",
    [用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      var infos = results.map(function (row) {
        return {
          资产编号: row.资产编号,
          资产名称: row.资产名称,
          资产类型: row.资产类型,
          购买日期: row.购买日期,
          购买价格: row.购买价格,
          折旧率: row.折旧率,
          当前价值: row.当前价值,
          位置: row.位置,
          状态: row.状态,
        };
      });
      res.send({ Infos: infos });
    }
  );
});

app.post("/api/updateFixedAssetStatus", function (req, res) {
  var 资产编号 = req.body.资产编号; // 从请求体中获取编号
  var 状态 = req.body.状态; // 从请求体中获取状态
  var 用户名 = req.body.用户名;

  connection.query(
    "UPDATE fixedAsset SET 状态 = ? WHERE 资产编号 = ? AND 用户名 = ?",
    [状态, 资产编号, 用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ message: "Status updated successfully!" });
    }
  );
});

//设备归还
app.post("/api/addDevice", function (req, res) {
  var 设备编号 = req.body.设备编号;
  var 设备名称 = req.body.设备名称;
  var 借用人 = req.body.借用人;
  var 借用日期 = req.body.借用日期;
  var 预计归还日期 = req.body.预计归还日期;
  var 实际归还日期 = req.body.实际归还日期;
  var 状态 = req.body.状态;
  var 用户名 = req.body.用户名;

  connection.query(
    "INSERT INTO 设备借用 (设备编号, 设备名称, 借用人, 借用日期, 预计归还日期, 实际归还日期, 状态, 用户名) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      设备编号,
      设备名称,
      借用人,
      借用日期,
      预计归还日期,
      实际归还日期,
      状态,
      用户名,
    ],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 插入成功
    }
  );
});

app.post("/api/deleteDevice", function (req, res) {
  var 设备编号 = req.body.设备编号;

  connection.query(
    "DELETE FROM 设备借用 WHERE 设备编号 = ?",
    [设备编号],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.sendStatus(200); // 删除成功
    }
  );
});

app.get("/api/getDevices", function (req, res) {
  var 用户名 = req.query.username; // 获取用户名参数
  connection.query(
    "SELECT * FROM 设备借用 WHERE 用户名 = ?",
    [用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      var infos = results.map(function (row) {
        return {
          设备编号: row.设备编号,
          设备名称: row.设备名称,
          借用人: row.借用人,
          借用日期: row.借用日期,
          预计归还日期: row.预计归还日期,
          实际归还日期: row.实际归还日期,
          状态: row.状态,
        };
      });
      res.send({ Infos: infos });
    }
  );
});

app.post("/api/updateDeviceStatus", function (req, res) {
  var 设备编号 = req.body.设备编号; // 从请求体中获取编号
  var 状态 = req.body.状态; // 从请求体中获取状态
  var 用户名 = req.body.用户名;

  connection.query(
    "UPDATE 设备借用 SET 状态 = ? WHERE 设备编号 = ? AND 用户名 = ?",
    [状态, 设备编号, 用户名],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("An error occurred");
        return;
      }
      res.send({ message: "Status updated successfully!" });
    }
  );
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
