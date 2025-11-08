import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// 生成台灣公司名稱
function generateTaiwanCompanyName() {
  const companyTypes = [
    "股份有限公司",
    "有限公司",
    "企業有限公司",
    "實業有限公司",
  ];
  const prefix = faker.company.name().replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "");
  return `${prefix}${faker.helpers.arrayElement(companyTypes)}`;
}

// 生成台灣地址
function generateTaiwanAddress() {
  const cities = ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"];
  const districts = [
    "中正區",
    "信義區",
    "大安區",
    "中山區",
    "板橋區",
    "中和區",
  ];
  const city = faker.helpers.arrayElement(cities);
  const district = faker.helpers.arrayElement(districts);
  const road = faker.location.street();
  const number = faker.number.int({ min: 1, max: 999 });
  return `${city}${district}${road}${number}號`;
}

// 生成發票號碼（格式：兩個英文字母 + 8 位數字）
function generateInvoiceNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter1 = faker.helpers.arrayElement(letters.split(""));
  const letter2 = faker.helpers.arrayElement(letters.split(""));
  const numbers = faker.string.numeric(8);
  return `${letter1}${letter2}${numbers}`;
}

// 生成統一編號（8 位數字）
function generateBan() {
  return faker.string.numeric(8);
}

// 生成發票期別（YYYYMM，民國年雙數月）
function generateInvPeriod(date: Date) {
  const year = date.getFullYear() - 1911; // 轉換為民國年
  const month = faker.helpers.arrayElement([2, 4, 6, 8, 10, 12]); // 雙數月
  return `${year}${month.toString().padStart(2, "0")}`;
}

// 生成時間格式 HH:mm:ss
function generateTime() {
  const hours = faker.number
    .int({ min: 0, max: 23 })
    .toString()
    .padStart(2, "0");
  const minutes = faker.number
    .int({ min: 0, max: 59 })
    .toString()
    .padStart(2, "0");
  const seconds = faker.number
    .int({ min: 0, max: 59 })
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

// 生成商品名稱
function generateProductName() {
  const products = [
    "瓶裝水",
    "土司",
    "衛生紙",
    "紅茶",
    "鳳梨酥",
    "綠茶",
    "高粱酒",
    "雞肉",
    "豬排",
    "咖啡",
  ];
  return faker.helpers.arrayElement(products);
}

async function main() {
  console.log("開始生成假資料...");

  // 清空現有資料
  await prisma.invoiceDetail.deleteMany();
  await prisma.invoice.deleteMany();
  console.log("已清空現有資料");

  // 生成發票數量
  const invoiceCount = 20;

  for (let i = 0; i < invoiceCount; i++) {
    // 生成發票日期（過去 1 年到現在）
    const invDate = faker.date.recent({ days: 365 });
    const invPeriod = generateInvPeriod(invDate);

    // 生成發票總金額
    const totalAmount = faker.number.float({
      min: 10,
      max: 10000,
      fractionDigits: 2,
    });

    // 生成發票
    const invoice = await prisma.invoice.create({
      data: {
        v: "0.5", // 版本號碼
        code: "200", // 訊息回應碼（成功）
        msg: "成功", // 系統回應訊息
        invNum: generateInvoiceNumber(), // 發票號碼
        invDate: invDate, // 發票開立日期
        sellerName: generateTaiwanCompanyName(), // 賣方名稱
        amount: totalAmount, // 總金額
        invStatus: faker.helpers.arrayElement(["已開立", "已作廢", "已折讓"]), // 發票狀態
        invPeriod: invPeriod, // 發票期別
        sellerBan: generateBan(), // 賣方營業人統編
        sellerAddress: faker.datatype.boolean(0.8)
          ? generateTaiwanAddress()
          : null, // 賣方營業人地址（80% 機率有地址）
        invoiceTime: generateTime(), // 發票開立時間
        buyerBan: faker.datatype.boolean(0.3) ? generateBan() : null, // 買方營業人統編（30% 機率有）
        currency: faker.datatype.boolean(0.9)
          ? "TWD"
          : faker.helpers.arrayElement(["USD", "EUR", "JPY"]), // 幣別（90% 是台幣）
      },
    });

    // 為每個發票生成 1-5 個明細項目
    const detailCount = faker.number.int({ min: 1, max: 5 });
    let calculatedTotal = 0;

    for (let j = 0; j < detailCount; j++) {
      const quantity = faker.number.float({
        min: 1,
        max: 10,
        fractionDigits: 2,
      });
      const unitPrice = faker.number.float({
        min: 10,
        max: 1000,
        fractionDigits: 2,
      });
      const amount = parseFloat((quantity * unitPrice).toFixed(2));

      await prisma.invoiceDetail.create({
        data: {
          invoiceId: invoice.id,
          rowNum: j + 1, // 明細編號從 1 開始
          description: generateProductName(), // 品名
          quantity: quantity, // 數量
          unitPrice: unitPrice, // 單價
          amount: amount, // 小計
        },
      });

      calculatedTotal += amount;
    }

    // 更新發票總金額為明細總和（可選，這裡保持原生成的金額）
    console.log(
      `已生成發票 ${i + 1}/${invoiceCount}: ${
        invoice.invNum
      } (${detailCount} 個明細項目)`
    );
  }

  console.log(`\n完成！已生成 ${invoiceCount} 筆發票資料`);
}

main()
  .catch((e) => {
    console.error("生成資料時發生錯誤:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
