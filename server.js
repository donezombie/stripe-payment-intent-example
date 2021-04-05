const express = require("express");

const app = express();
const stripe = require("stripe")(
  "sk_test_51IcSDlJdBQrQaBlFulOaCbGrrQ1pMJhMgc0WM1e9NeeD6fIZxVfqq2z2UyOfyRAIlzYlfSU2ON1C5fYDvOBPNydk007Zpyf8OV"
);

app.use(express.json());
app.use(express.static("public"));

app.get('/get-list-card', async (req, res) => {
  try {
    const customers = await stripe.customers.list({
      limit: 10,
    });
    res.send(JSON.stringify(customers));
  } catch (error) {
    res.send(JSON.stringify(error));
  }
})

app.post("/create-card", async (req, res) => {
  try {

    const idToken = req.body.token.token.id;
    const customer = await stripe.customers.create({
      description: "My First Test Customer (created for API docs)",
    });

    const idCustomer = customer.id;
    const card = await stripe.customers.createSource(idCustomer, {
      source: idToken,
    });

    res.send(JSON.stringify(card));
  } catch (error) {
    res.send(JSON.stringify(error));
  }
});

app.post("/payments", async (req, res) => {
  try {

    const idCustomer = "cus_JF1edmjsIexpjI";
    const idCard = "card_1IcXbOJdBQrQaBlFcgh3Pncn";
    const result = await stripe.paymentIntents.create({
      amount: 2500,
      currency: "usd",
      payment_method_types: ["card"],
      customer: idCustomer
    });

    const idPaymentIntent = result.id;
    const paymentIntentConfirm = await stripe.paymentIntents.confirm(idPaymentIntent, {
      payment_method: idCard,
      return_url: "http://localhost:8080/check_auth.html"
    });

    res.send(JSON.stringify(paymentIntentConfirm));
  } catch (error) {
    res.send(JSON.stringify(error));
  }
});

app.post("/confirm-payment", async (req, res) => {});

app.listen(8080, () => console.log("Node started!"));
