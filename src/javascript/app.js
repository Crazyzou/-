// 获取DOM元素
const sideMenu = document.querySelector("aside"),
  themeToggler = document.querySelector(".theme-toggler");

// 切换主题
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  document.body.classList.add(storedTheme);
  if (storedTheme === "dark-theme-variables") {
    themeToggler.querySelector("span:nth-child(1)").classList.remove("active");
    themeToggler.querySelector("span:nth-child(2)").classList.add("active");
  } else {
    themeToggler.querySelector("span:nth-child(1)").classList.add("active");
    themeToggler.querySelector("span:nth-child(2)").classList.remove("active");
  }
}

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");

  if (document.body.classList.contains("dark-theme-variables")) {
    localStorage.setItem("theme", "dark-theme-variables");
  } else {
    localStorage.setItem("theme", "light-theme-variables");
  }
});

// 切换侧边栏菜单项的激活状态
const itemSideBarMenu = document.querySelectorAll(".sidebar  a");
itemSideBarMenu.forEach((item) => {
  item.addEventListener("click", function () {
    itemSideBarMenu.forEach((item) => {
      item.classList.remove("active");
    });
    item.classList.add("active");
  });
});

//基本信息管理
function displayInsights() {
  window.location.href = "basic.html";
}

//采购申请信息管理
function displayPurchase() {
  window.location.href = "purchase.html";
}

//资产采购信息管理
function displayAssetPurchase() {
  window.location.href = "asset-purchase.html";
}

//采购发放信息管理
function displayAssetGive() {
  window.location.href = "asset-give.html";
}

//固定资产管理
function displayFixedAsset() {
  window.location.href = "fixed-asset.html";
}

//设备归还管理
function displayFacility() {
  window.location.href = "facility.html";
}

//盘点信息管理
function displayResort() {
  window.location.href = "resort.html";
}

//设计
function displaySetting() {
  window.location.href = "setting.html";
}

// 定义一个通用的XHR请求函数
function makeRequest(method, url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send();
}

// 定义一个函数来处理按钮点击事件
function handleButtonClick(
  buttonId,
  modalId1,
  modalId2,
  displayStyle1,
  displayStyle2
) {
  var button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", function () {
      document.getElementById(modalId1).style.display = displayStyle1;
      document.getElementById(modalId2).style.display = displayStyle2;
    });
  }
}

window.addEventListener("load", function () {
  var username = localStorage.getItem("username"); // 获取用户名

  // 页面字体改变
  makeRequest("GET", "/api/getFontSize?username=" + username, function (data) {
    var fontSize = data.FontChoice; // 获取返回的fontSize值
    document.documentElement.style.setProperty("--font-multiple", fontSize);
    var button = document.getElementById("font-size-button");
    if (button) {
      // 检查按钮是否存在
      button.innerText =
        fontSize == "0.95" ? "小" : fontSize == "1" ? "中" : "大";
    }
  });

  // 通知显示
  makeRequest("GET", "/api/getMessage?username=" + username, function (data) {
    var NotificationsEnabled = data.NotificationsEnabled;
    var button = document.getElementById("toggle-button");
    var messageCount = document.getElementById("message-count");
    if (button) {
      button.innerText = NotificationsEnabled ? "是" : "否";
    }
    if (messageCount) {
      messageCount.style.display = NotificationsEnabled ? "block" : "none";
    }
  });

  // 获取用户昵称
  makeRequest("GET", "/api/getUserNick?username=" + username, function (data) {
    var nickname = data.Nickname; // 获取返回的昵称值
    document.querySelector(".info b").innerText = nickname; // 更新昵称
    document.querySelector(".item input[type='text']").value = nickname; // 更新昵称输入框
  });

  // 邮箱
  makeRequest("GET", "/api/getUserEmail?username=" + username, function (data) {
    var email = data.Email; // 获取返回的电子邮件值
    document.querySelector(".item input[type='email']").value = email; // 更新电子邮件输入框
  });

  // 语言
  checkLanguage();

  // 处理按钮点击事件
  handleButtonClick("add", "addModal", "deleteModal", "block", "none");
  handleButtonClick("delete", "deleteModal", "addModal", "block", "none");

  //采购申请
  if (window.location.pathname === "/purchase.html") {
    //显示数据
    makeRequest(
      "GET",
      "/api/getPurchases?username=" + username,
      function (data) {
        var Purchases = data.Purchases; // 获取返回的数据
        for (var i = 0; i < Purchases.length; i++) {
          var tr = document.createElement("tr");
          var statusColor = "";
          switch (Purchases[i].Status) {
            case "已审核":
              statusColor = "orange";
              break;
            case "已复核":
              statusColor = "green";
              break;
            case "已打回":
              statusColor = "red";
              break;
          }
          tr.innerHTML =
            "<td>" +
            (i + 1) +
            "</td><td>" +
            Purchases[i].OrderNumber +
            "</td><td>" +
            Purchases[i].OrderTime +
            "</td><td style='color:" +
            statusColor +
            "'>" +
            Purchases[i].Status +
            '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td>';
          document.querySelector("#order-table").appendChild(tr);
        }
      }
    );

    document.getElementById("confirm").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("addModal").style.display = "none";

      // 检查非空
      var orderNumber = document.getElementById("orderNumber").value;
      var orderTime = document.getElementById("orderTime").value;
      var status = document.getElementById("status").value;

      if (!orderNumber || !orderTime || !status) {
        alert("所有字段都必须填写！");
        return;
      }

      // 获取当前表格的行数，用于生成新行的序号
      var rowCount = document.querySelector("#order-table").rows.length;

      // 将填写的信息都插入到创建的表里面
      var tr = document.createElement("tbody");
      tr.innerHTML =
        "<tr><td>" +
        rowCount +
        "</td><td>" +
        orderNumber +
        "</td><td>" +
        orderTime +
        "</td><td>" +
        status +
        '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td></tr>';
      document.querySelector("#order-table").appendChild(tr);

      // 使用API将填写的信息插入到数据库中
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/addPurchase");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          orderNumber: orderNumber,
          orderTime: orderTime,
          status: status,
          username: username,
        })
      );
    });

    // 点击确认删除按钮后将deleteModal的信息从表格中删除，删除后再将数据从数据库中删除
    document
      .getElementById("confirm-d")
      .addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("deleteModal").style.display = "none";

        // 获取要删除的行序号
        var rowIndex = document.getElementById("row").value;
        // 获取表格中的行
        var row = document.querySelector("#order-table").rows[rowIndex];
        // 从表格中删除指定的行
        document.querySelector("#order-table").deleteRow(rowIndex);
        location.reload();
        // 获取当前行的Supplier和Delivery_Date值
        var orderNumber = row.cells[1].innerText;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/deletePurchase");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
          JSON.stringify({
            orderNumber: orderNumber,
          })
        );
      });
    //按钮更新
    setTimeout(function () {
      var checkButtons = document.querySelectorAll(".check");

      var reCheckButtons = document.querySelectorAll(".re-check");

      var backButtons = document.querySelectorAll(".back");

      checkButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[3].innerText = "已审核";
          row.cells[3].style.color = "orange";
          var orderNumber = row.cells[1].innerText;
          var status = "已审核";
          updateStatus(orderNumber, status);
        });
      });

      reCheckButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;

          row.cells[3].innerText = "已复核";
          row.cells[3].style.color = "green";
          var orderNumber = row.cells[1].innerText;
          var status = "已复核";
          updateStatus(orderNumber, status);
        });
      });

      backButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[3].innerText = "已打回";
          row.cells[3].style.color = "red";
          var orderNumber = row.cells[1].innerText;
          var status = "已打回";
          updateStatus(orderNumber, status);
        });
      });
    }, 100);

    function updateStatus(orderNumber, status) {
      var username = localStorage.getItem("username");

      fetch("/api/updatePurchaseStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          orderNumber: orderNumber,
          status: status,
        }),
      });
    }
  }

  // 资产采购
  if (window.location.pathname === "/asset-purchase.html") {
    //显示数据
    makeRequest(
      "GET",
      "/api/getAssetPurchases?username=" + username,
      function (data) {
        var assetPurchases = data.AssetPurchases; // 获取返回的资产购买数据
        for (var i = 0; i < assetPurchases.length; i++) {
          // 将每条资产购买数据插入到表格中
          var tr = document.createElement("tr");
          var statusColor = "";
          switch (assetPurchases[i].Status) {
            case "已审核":
              statusColor = "orange";
              break;
            case "已复核":
              statusColor = "green";
              break;
            case "已打回":
              statusColor = "red";
              break;
          }
          tr.innerHTML =
            "<td>" +
            (i + 1) +
            "</td><td>" +
            assetPurchases[i].Supplier +
            "</td><td>" +
            assetPurchases[i].Price +
            "</td><td>" +
            assetPurchases[i].Quantity +
            "</td><td>" +
            assetPurchases[i].Delivery_Date +
            "</td><td style='color:" +
            statusColor +
            "'>" +
            assetPurchases[i].Status +
            '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td>';
          document.querySelector("#newspaper-b").appendChild(tr);
        }
      }
    );

    // 点击确认按钮后将modal的填入的信息插入表格同时检查非空
    document.getElementById("confirm").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("addModal").style.display = "none";

      // 检查非空
      var supplier = document.getElementById("supplier").value;
      var price = document.getElementById("price").value;
      var quantity = document.getElementById("quantity").value;
      var deliveryDate = document.getElementById("deliveryDate").value;
      var status = document.getElementById("status").value;

      if (!supplier || !price || !quantity || !deliveryDate || !status) {
        alert("所有字段都必须填写！");
        return;
      }

      // 获取当前表格的行数，用于生成新行的序号
      var rowCount = document.querySelector("#newspaper-b").rows.length;

      // 将填写的信息都插入到创建的表里面
      var tr = document.createElement("tbody");
      tr.innerHTML =
        "<tr><td>" +
        rowCount +
        "</td><td>" +
        supplier +
        "</td><td>" +
        price +
        "</td><td>" +
        quantity +
        "</td><td>" +
        deliveryDate +
        "</td><td>" +
        status +
        '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td></tr>';
      document.querySelector("#newspaper-b").appendChild(tr);

      // 使用API将填写的信息插入到数据库中
      var username = localStorage.getItem("username");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/addAssetPurchase");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          supplier: supplier,
          price: price,
          quantity: quantity,
          deliveryDate: deliveryDate,
          status: status,
          username: username,
        })
      );
    });

    // 点击确认删除按钮后将deleteModal的信息从表格中删除，删除后再将数据从数据库中删除
    document
      .getElementById("confirm-d")
      .addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("deleteModal").style.display = "none";

        // 获取要删除的行序号
        var rowIndex = document.getElementById("row").value;

        if (!rowIndex) {
          alert("请输入要删除的行序号！");
          return;
        }

        // 获取表格中的行
        var row = document.querySelector("#newspaper-b").rows[rowIndex];

        // 从表格中删除指定的行
        document.querySelector("#newspaper-b").deleteRow(rowIndex);
        location.reload();
        // 获取当前行的Supplier和Delivery_Date值
        var username = localStorage.getItem("username");
        var supplier = row.cells[1].innerText;
        var status = row.cells[5].innerText;

        // 使用API将Supplier和Delivery_Date值传递给路由
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/deleteAssetPurchase");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
          JSON.stringify({
            username: username,
            supplier: supplier,
            status: status,
          })
        );
      });
    //按钮更新
    setTimeout(function () {
      var checkButtons = document.querySelectorAll(".check");

      var reCheckButtons = document.querySelectorAll(".re-check");

      var backButtons = document.querySelectorAll(".back");

      checkButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[5].innerText = "已审核";
          row.cells[5].style.color = "orange";
          var supplier = row.cells[1].innerText;
          var status = "已审核";
          updateStatus(supplier, status);
        });
      });

      reCheckButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;

          row.cells[5].innerText = "已复核";
          row.cells[5].style.color = "green";
          var supplier = row.cells[1].innerText;
          var status = "已复核";
          updateStatus(supplier, status);
        });
      });

      backButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[5].innerText = "已打回";
          row.cells[5].style.color = "red";
          var supplier = row.cells[1].innerText;
          var status = "已打回";
          updateStatus(supplier, status);
        });
      });
    }, 100);

    function updateStatus(supplier, status) {
      var username = localStorage.getItem("username");

      fetch("/api/updateAssetPurchaseStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          supplier: supplier,
          status: status,
        }),
      });
    }
  }

  //资产发放
  if (window.location.pathname === "/asset-give.html") {
    //显示数据
    makeRequest(
      "GET",
      "/api/getAssetGive?username=" + username,

      function (data) {
        var Infos = data.Infos; // 获取返回的数据
        for (var i = 0; i < Infos.length; i++) {
          var tr = document.createElement("tr");
          var statusColor = "";
          switch (Infos[i].状态) {
            case "已审核":
              statusColor = "orange";
              break;
            case "已复核":
              statusColor = "green";
              break;
            case "已打回":
              statusColor = "red";
              break;
          }

          tr.innerHTML =
            "<td>" +
            Infos[i].编号 +
            "</td><td>" +
            Infos[i].名称 +
            "</td><td>" +
            Infos[i].购置价格 +
            "</td><td>" +
            Infos[i].使用人 +
            "</td><td>" +
            Infos[i].发放日期 +
            "</td><td>" +
            Infos[i].累计折旧 +
            "</td><td style='color:" +
            statusColor +
            "'>" +
            Infos[i].状态 +
            '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td>';
          document.querySelector("#ver-minimalist").appendChild(tr);
        }
      }
    );

    document.getElementById("confirm").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("addModal").style.display = "none";

      // 检查非空
      var 编号 = document.getElementById("orderNumber").value;
      var 名称 = document.getElementById("orderTime").value;
      var 购置价格 = document.getElementById("price").value;
      var 使用人 = document.getElementById("user").value;
      var 发放日期 = document.getElementById("date").value;
      var 累计折旧 = document.getElementById("depreciation").value;
      var 状态 = document.getElementById("status").value;
      var 用户名 = localStorage.getItem("username");

      // 将填写的信息都插入到创建的表里面
      var tr = document.createElement("tbody");
      tr.innerHTML =
        "<tr><td>" +
        编号 +
        "</td><td>" +
        名称 +
        "</td><td>" +
        购置价格 +
        "</td><td>" +
        使用人 +
        "</td><td>" +
        发放日期 +
        "</td><td>" +
        累计折旧 +
        "</td><td>" +
        状态 +
        '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td></tr>';
      document.querySelector("#ver-minimalist").appendChild(tr);

      // 使用API将填写的信息插入到数据库中
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/addAssetGive");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          编号: 编号,
          名称: 名称,
          购置价格: 购置价格,
          使用人: 使用人,
          发放日期: 发放日期,
          累计折旧: 累计折旧,
          状态: 状态,
          用户名: 用户名,
        })
      );
    });

    // 点击确认删除按钮后将deleteModal的信息从表格中删除，删除后再将数据从数据库中删除
    document
      .getElementById("confirm-d")
      .addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("deleteModal").style.display = "none";

        var rowIndex = document.getElementById("row").value;

        var row = document.querySelector("#ver-minimalist").rows[rowIndex];

        document.querySelector("#ver-minimalist").deleteRow(rowIndex);
        location.reload();
        var 编号 = row.cells[0].innerText;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/deleteAssetGive");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
          JSON.stringify({
            编号: 编号,
          })
        );
      });

    setTimeout(function () {
      var checkButtons = document.querySelectorAll(".check");

      var reCheckButtons = document.querySelectorAll(".re-check");

      var backButtons = document.querySelectorAll(".back");

      checkButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[6].innerText = "已审核";
          row.cells[6].style.color = "orange";
          var orderNumber = row.cells[0].innerText;
          var status = "已审核";
          updateStatus(orderNumber, status);
        });
      });

      reCheckButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;

          row.cells[6].innerText = "已复核";
          row.cells[6].style.color = "green";
          var orderNumber = row.cells[0].innerText;
          var status = "已复核";
          updateStatus(orderNumber, status);
        });
      });

      backButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[6].innerText = "已打回";
          row.cells[6].style.color = "red";
          var orderNumber = row.cells[0].innerText;
          var status = "已打回";
          updateStatus(orderNumber, status);
        });
      });
    }, 100);

    function updateStatus(orderNumber, status) {
      var username = localStorage.getItem("username");

      fetch("/api/updateAssetGiveStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          用户名: username,
          编号: orderNumber,
          状态: status,
        }),
      });
    }
  }

  //固定资产
  if (window.location.pathname === "/fixed-asset.html") {
    // 显示数据
    makeRequest(
      "GET",
      "/api/getFixedAssets?username=" + localStorage.getItem("username"),
      function (data) {
        var Assets = data.Infos; // 获取返回的数据
        for (var i = 0; i < Assets.length; i++) {
          var date = new Date(Assets[i].购买日期);
          var formattedDate = date.toLocaleDateString();

          var tr = document.createElement("tr");
          var statusColor = "";
          switch (Assets[i].状态) {
            case "已审核":
              statusColor = "orange";
              break;
            case "已复核":
              statusColor = "green";
              break;
            case "已打回":
              statusColor = "red";
              break;
          }
          tr.innerHTML =
            "<td>" +
            Assets[i].资产编号 +
            "</td><td>" +
            Assets[i].资产名称 +
            "</td><td>" +
            Assets[i].资产类型 +
            "</td><td>" +
            formattedDate +
            "</td><td>" +
            Assets[i].购买价格 +
            "</td><td>" +
            Assets[i].折旧率 +
            "</td><td>" +
            Assets[i].位置 +
            "</td><td style='color:" +
            statusColor +
            "'>" +
            Assets[i].状态 +
            '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td>';
          document.querySelector("#order-table").appendChild(tr);
        }
      }
    );

    document.getElementById("confirm").addEventListener("click", function (e) {
      e.preventDefault();

      document.getElementById("addModal").style.display = "none";

      var 资产编号 = document.getElementById("assetNumber").value;
      var 资产名称 = document.getElementById("assetName").value;
      var 资产类型 = document.getElementById("assetType").value;
      var 购买日期 = document.getElementById("purchaseDate").value;
      var 购买价格 = document.getElementById("purchasePrice").value;
      var 折旧率 = document.getElementById("depreciationRate").value;
      var 当前价值 = document.getElementById("currentValue").value;
      var 位置 = document.getElementById("location").value;
      var 状态 = document.getElementById("status").value;
      // 将填写的信息都插入到创建的表里面
      var tr = document.createElement("tbody");
      tr.innerHTML =
        "<tr><td>" +
        资产编号 +
        "</td><td>" +
        资产名称 +
        "</td><td>" +
        资产类型 +
        "</td><td>" +
        购买日期 +
        "</td><td>" +
        购买价格 +
        "</td><td>" +
        折旧率 +
        "</td><td>" +
        位置 +
        "</td><td>" +
        状态 +
        '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td></tr>';
      document.querySelector("#order-table").appendChild(tr);

      // 使用API将填写的信息插入到数据库中
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/addFixedAsset");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          资产编号: 资产编号,
          资产名称: 资产名称,
          资产类型: 资产类型,
          购买日期: 购买日期,
          购买价格: 购买价格,
          折旧率: 折旧率,
          当前价值: 当前价值,
          位置: 位置,
          状态: 状态,
          用户名: localStorage.getItem("username"),
        })
      );
    });

    setTimeout(function () {
      var checkButtons = document.querySelectorAll(".check");
      var reCheckButtons = document.querySelectorAll(".re-check");
      var backButtons = document.querySelectorAll(".back");

      checkButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[7].innerText = "已审核";
          row.cells[7].style.color = "orange";
          var 资产编号 = row.cells[0].innerText;
          var 状态 = "已审核";
          updateStatus(资产编号, 状态);
        });
      });

      reCheckButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[7].innerText = "已复核";
          row.cells[7].style.color = "green";
          var 资产编号 = row.cells[0].innerText;
          var 状态 = "已复核";
          updateStatus(资产编号, 状态);
        });
      });

      backButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[7].innerText = "已打回";
          row.cells[7].style.color = "red";
          var 资产编号 = row.cells[0].innerText;
          var 状态 = "已打回";
          updateStatus(资产编号, 状态);
        });
      });
    }, 100);

    function updateStatus(资产编号, 状态) {
      var 用户名 = localStorage.getItem("username");

      fetch("/api/updateFixedAssetStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          用户名: 用户名,
          资产编号: 资产编号,
          状态: 状态,
        }),
      });
    }

    // 点击确认删除按钮后将deleteModal的信息从表格中删除，删除后再将数据从数据库中删除
    document
      .getElementById("confirm-d")
      .addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("deleteModal").style.display = "none";

        // 获取要删除的行序号
        var rowIndex = document.getElementById("row").value;
        // 获取表格中的行
        var row = document.querySelector("#order-table").rows[rowIndex];
        // 从表格中删除指定的行
        document.querySelector("#order-table").deleteRow(rowIndex);
        location.reload();
        // 获取当前行的资产编号值
        var 资产编号 = row.cells[0].innerText;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/deleteFixedAsset");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
          JSON.stringify({
            资产编号: 资产编号,
          })
        );
      });
  }

  //设备归还
  if (window.location.pathname === "/facility.html") {
    //显示数据
    makeRequest("GET", "/api/getDevices?username=" + localStorage.getItem("username"), function (data) {
      var Devices = data.Infos; // 获取返回的数据
      for (var i = 0; i < Devices.length; i++) {
        var tr = document.createElement("tr");
        
        var statusColor = "";
        switch (Devices[i].状态) {
          case "已审核":
            statusColor = "orange";
            break;
          case "已复核":
            statusColor = "green";
            break;
          case "已打回":
            statusColor = "red";
            break;
        }

        var date = new Date(Devices[i].借用日期);
        var formattedDate = date.toLocaleDateString();
        var date1 = new Date(Devices[i].预计归还日期);
          var formattedDate1 = date1.toLocaleDateString();
          var date2 = new Date(Devices[i].实际归还日期);
          var formattedDate2 = date2.toLocaleDateString();
        tr.innerHTML =
          "<td>" +
          Devices[i].设备编号 +
          "</td><td>" +
          Devices[i].设备名称 +
          "</td><td>" +
          Devices[i].借用人 +
          "</td><td>" +
          formattedDate +
          "</td><td>" +
          formattedDate1 +
          "</td><td>" +
          formattedDate2 +
          "</td><td style='color:" +
          statusColor +
          "'>" +
          Devices[i].状态 +
          '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td>';
        document.querySelector("#newspaper-b").appendChild(tr);
      }
    });

    document.getElementById("confirm").addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("addModal").style.display = "none";

      // 检查非空
      var 设备编号 = document.getElementById("设备编号").value;
      var 设备名称 = document.getElementById("设备名称").value;
      var 借用人 = document.getElementById("借用人").value;
      var 借用日期 = document.getElementById("借用日期").value;
      var 预计归还日期 = document.getElementById("预计归还日期").value;
      var 实际归还日期 = document.getElementById("实际归还日期").value;
      var 状态 = document.getElementById("状态").value;
      var 用户名 = localStorage.getItem("username");

      // 将填写的信息都插入到创建的表里面
      var tr = document.createElement("tbody");
      tr.innerHTML =
        "<tr><td>" +
        设备编号 +
        "</td><td>" +
        设备名称 +
        "</td><td>" +
        借用人 +
        "</td><td>" +
        借用日期 +
        "</td><td>" +
        预计归还日期 +
        "</td><td>" +
        实际归还日期 +
        "</td><td>" +
        状态 +
        '</td><td><button class="check">审核</button><button class="re-check">复核</button><button class="back">打回</button></td></tr>';
      document.querySelector("#newspaper-b").appendChild(tr);

      // 使用API将填写的信息插入到数据库中
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/addDevice");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          设备编号: 设备编号,
          设备名称: 设备名称,
          借用人: 借用人,
          借用日期: 借用日期,
          预计归还日期: 预计归还日期,
          实际归还日期: 实际归还日期,
          状态: 状态,
          用户名: 用户名,
        })
      );
    });

    // 点击确认删除按钮后将deleteModal的信息从表格中删除，删除后再将数据从数据库中删除
    document
      .getElementById("confirm-d")
      .addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("deleteModal").style.display = "none";

        // 获取要删除的行序号
        var rowIndex = document.getElementById("row").value;
        // 获取表格中的行
        var row = document.querySelector("#newspaper-b").rows[rowIndex];
        // 从表格中删除指定的行
        document.querySelector("#newspaper-b").deleteRow(rowIndex);
        location.reload();
        // 获取当前行的设备编号值
        var 设备编号 = row.cells[0].innerText;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/deleteDevice");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
          JSON.stringify({
            设备编号: 设备编号,
          })
        );
      });
    setTimeout(function () {
      var checkButtons = document.querySelectorAll(".check");
      var reCheckButtons = document.querySelectorAll(".re-check");
      var backButtons = document.querySelectorAll(".back");

      checkButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[6].innerText = "已审核";
          row.cells[6].style.color = "orange";
          var 设备编号 = row.cells[0].innerText;
          var 状态 = "已审核";
          updateStatus(设备编号, 状态);
        });
      });

      reCheckButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[6].innerText = "已复核";
          row.cells[6].style.color = "green";
          var 设备编号 = row.cells[0].innerText;
          var 状态 = "已复核";
          updateStatus(设备编号, 状态);
        });
      });

      backButtons.forEach(function (button, index) {
        button.addEventListener("click", function (e) {
          var row = e.target.parentNode.parentNode;
          row.cells[6].innerText = "已打回";
          row.cells[6].style.color = "red";
          var 设备编号 = row.cells[0].innerText;
          var 状态 = "已打回";
          updateStatus(设备编号, 状态);
        });
      });
    }, 100);

    function updateStatus(设备编号, 状态) {
      var 用户名 = localStorage.getItem("username");

      fetch("/api/updateDeviceStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          用户名: 用户名,
          设备编号: 设备编号,
          状态: 状态,
        }),
      });
    }
  }
});

function checkLanguage() {
  var username = localStorage.getItem("username");
  var xhr_language = new XMLHttpRequest();
  xhr_language.open("GET", "/api/getUserLanguage?username=" + username);
  xhr_language.onreadystatechange = function () {
    if (xhr_language.readyState === 4 && xhr_language.status === 200) {
      currentLanguage = JSON.parse(xhr_language.responseText).LanguageSetting;
      localStorage.setItem("language", currentLanguage);
      translatePage();
    }
  };
  xhr_language.send();
}

function changeLanguage() {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  localStorage.setItem("language", currentLanguage);
  translatePage();

  // 更新用户的语言设置
  var username = localStorage.getItem("username");
  var xhr_language = new XMLHttpRequest();
  xhr_language.open(
    "GET",
    "/api/setUserLanguage?username=" +
      username +
      "&LanguageSetting=" +
      currentLanguage
  );
  xhr_language.onreadystatechange = function () {
    if (xhr_language.readyState === 4 && xhr_language.status === 200) {
      console.log("Language setting updated successfully.");
    } else if (xhr_language.readyState === 4) {
      console.log("An error occurred while updating the language setting.");
    }
  };
  xhr_language.send();
}

function translatePage() {
  var allElements = document.getElementsByTagName("*");
  for (var i = 0, max = allElements.length; i < max; i++) {
    translateElement(allElements[i]);
  }
}

function translateElement(element) {
  if (element.hasChildNodes()) {
    element.childNodes.forEach(function (child) {
      if (
        child.nodeType === Node.TEXT_NODE &&
        child.textContent.trim() !== ""
      ) {
        var translatedText =
          languageResources[currentLanguage][child.textContent.trim()];
        if (translatedText) {
          child.textContent = translatedText;
        }
      }
    });
  }
}

var languageResources = {
  en: {
    编号: "Number",
    日期: "Date",
    人员: "Personnel",
    部门: "Department",
    资产名称: "Asset Name",
    预期数量: "Expected Quantity",
    实际数量: "Actual Quantity",
    差异: "Difference",
    备注: "Remarks",
    添加信息: "Add Information",
    删除信息: "Delete Information",
    设备编号: "Device Number",
    设备名称: "Device Name",
    借用人: "Borrower",
    借用日期: "Borrowing Date",
    预计归还日期: "Expected Return Date",
    实际归还日期: "Actual Return Date",
    状态: "Status",
    操作: "Operation",
    审核: "Audit",
    复核: "Review",
    打印: "Print",
    资产编号: "Asset Number",
    资产名称: "Asset Name",
    资产类型: "Asset Type",
    购买日期: "Purchase Date",
    购买价格: "Purchase Price",
    折旧率: "Depreciation Rate",
    当前价值: "Current Value",
    位置: "Location",
    编号: "Number",
    名称: "Name",
    购置价格: "Purchase Price",
    使用人: "User",
    发放日期: "Issuance Date",
    累计折旧: "Accumulated Depreciation",
    序号: "Serial Number",
    供货商: "Supplier",
    价格: "Price",
    数量: "Quantity",
    交货日期: "Delivery Date",
    订单编号: "Order Number",
    订单发起时间: "Order Initiation Time",
    "土地、房屋及构筑物": "Land, Buildings and Structures",
    通用设备: "General Equipment",
    专用设备: "Special Equipment",
    文物和陈列品: "Cultural Relics and Exhibits",
    "图书、档案": "Books and Archives",
    "家具、用具、装具及动植物": "Furniture, Utensils, Fittings and Plants",
    基本信息管理: "Basic Information Management",
    采购申请信息管理: "Purchase Request Information Management",
    资产采购信息管理: "Asset Application Information Management",
    资产发放信息管理: "Asset Distribution Information Management",
    固定资产信息管理: "Fixed Asset Management",
    设备借用归还管理: "Device Borrowing and Returning Management",
    盘点信息管理: "Inventory Information Management",
    设置: "Settings",
    通用设置: "General Settings",
    "启用通知：": "Enable Notifications:",
    是: "Yes",
    否: "No",
    小: "S",
    中: "M",
    大: "L",
    个人信息: "Personal Information",
    "昵称：": "Nick:",
    "邮箱：": "Email:",
    保存: "Save",
    安全设置: "Security Settings",
    "密码：": "Pwd:",
    "启用两步验证：": "Enable Two-step:",
    语言设置: "Language Settings",
    显示设置: "Display Settings",
    "字体大小：": "Font Size:",
    备份与恢复: "Backup and Restore",
    备份数据: "Backup Data",
    恢复数据: "Restore Data",
    "欢迎使用！": "Welcome to Use!",
    左侧可更改日夜模式: "The left side can change the day and night mode",
    "语言：": "Language:",
    中文: "English",
  },
  zh: {
    "Basic Information Management": "基本信息管理",
    "Purchase Request Information Management": "采购申请信息管理",
    "Asset Application Information Management": "资产采购信息管理",
    "Asset Distribution Information Management": "资产发放信息管理",
    "Fixed Asset Management": "固定资产信息管理",
    "Device Borrowing and Returning Management": "设备借用归还管理",
    "Inventory Information Management": "盘点信息管理",
    Settings: "设置",
    "General Settings": "通用设置",
    "Enable Notifications:": "启用通知：",
    Yes: "是",
    No: "否",
    S: "小",
    M: "中",
    L: "大",
    "Personal Information": "个人信息",
    "Nick:": "昵称：",
    "Email:": "邮箱：",
    Save: "保存",
    "Security Settings": "安全设置",
    "Pwd:": "密码：",
    "Enable Two-step:": "启用两步验证：",
    "Language Settings": "语言设置",
    "Display Settings": "显示设置",
    "Font Size:": "字体大小：",
    "Backup and Restore": "备份与恢复",
    "Backup Data": "备份数据",
    "Restore Data": "恢复数据",
    "Welcome to Use!": "欢迎使用！",
    "The left side can change the day and night mode": "左侧可更改日夜模式",
    "Language:": "语言：",
    English: "中文",
    Number: "编号",
    Date: "日期",
    Personnel: "人员",
    Department: "部门",
    "Asset Name": "资产名称",
    "Expected Quantity": "预期数量",
    "Actual Quantity": "实际数量",
    Difference: "差异",
    Remarks: "备注",
    "Add Information": "添加信息",
    "Delete Information": "删除信息",
    "Device Number": "设备编号",
    "Device Name": "设备名称",
    Borrower: "借用人",
    "Borrowing Date": "借用日期",
    "Expected Return Date": "预计归还日期",
    "Actual Return Date": "实际归还日期",
    Status: "状态",
    Operation: "操作",
    Audit: "审核",
    Review: "复核",
    Print: "打印",
    "Asset Number": "资产编号",
    "Asset Type": "资产类型",
    "Purchase Date": "购买日期",
    "Purchase Price": "购买价格",
    "Depreciation Rate": "折旧率",
    "Current Value": "当前价值",
    Location: "位置",
    Name: "名称",
    "Purchase Price": "购置价格",
    User: "使用人",
    "Issuance Date": "发放日期",
    "Accumulated Depreciation": "累计折旧",
    "Serial Number": "序号",
    Supplier: "供货商",
    Price: "价格",
    Quantity: "数量",
    "Delivery Date": "交货日期",
    "Order Number": "订单编号",
    "Order Initiation Time": "订单发起时间",
    "Land, Buildings and Structures": "土地、房屋及构筑物",
    "General Equipment": "通用设备",
    "Special Equipment": "专用设备",
    "Cultural Relics and Exhibits": "文物和陈列品",
    "Books and Archives": "图书、档案",
    "Furniture, Utensils, Fittings and Plants": "家具、用具、装具及动植物",
  },
};
