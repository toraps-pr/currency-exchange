const API_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";

// Оголошення змінних для DOM-елементів
const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const form = document.getElementById("currencyForm");
const uahLabel = document.querySelector(".grid-box-item-2 .text-usual-accent");
const resultAmount = document.querySelector(".calculated-amount");
const dateField = document.querySelector(".date-of-relevance");
const currentRateField = document.querySelector(".current-rate");

// Формат дати
function formatDate(date) {
  return new Date(date).toLocaleDateString("uk-UA");
}

// Нормалізація введеної суми
function normalizeAmount(value) {
  return parseFloat(value.trim().replace(/\s+/g, "").replace(",", "."));
}

// Отримання курсу
async function getCurrencyData(currencyCode) {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data.find(item => item.cc === currencyCode);
}

// Оновлення курсу
async function updateCurrentRate() {
  try {
    const currency = currencySelect.value;
    const currencyData = await getCurrencyData(currency);

    if (!currencyData) return;

    currentRateField.textContent = `1 ${currency} = ${currencyData.rate} UAH`;
    dateField.textContent = "relevant to " + currencyData.exchangedate;

  } catch (error) {
    console.error("Error while getting the rate:", error);
    currentRateField.textContent = "Error loading rate";
  }
}

// При завантаженні
updateCurrentRate();

// Зміна валюти
currencySelect.addEventListener("change", updateCurrentRate);

// Кнопка "Calculate"
form.querySelector(".calculate_btn").addEventListener("click", async (e) => {
  e.preventDefault();

  const amount = normalizeAmount(amountInput.value);
  const currency = currencySelect.value;

  if (isNaN(amount) || amount <= 0) {
    alert("Enter the correct amount in hryvnias!");
    return;
  }

  try {
    const currencyData = await getCurrencyData(currency);
    if (!currencyData) {
      alert("Currency not found!");
      return;
    }

    const converted = (amount / currencyData.rate).toFixed(2);

    uahLabel.textContent = `${amount} UAH =`;
    resultAmount.textContent = `${converted} ${currency}`;

    amountInput.value = "";
  } catch (error) {
    console.error("Error while getting the rate:", error);
    alert("Could not retrieve exchange rate. Please try again later.");
  }
});

// Кнопка "Reset"
form.querySelector(".reset_btn").addEventListener("click", (e) => {
  e.preventDefault();
  amountInput.value = "";
  uahLabel.textContent = "0 UAH =";
  resultAmount.textContent = `0.0 ${currencySelect.value}`;
});
