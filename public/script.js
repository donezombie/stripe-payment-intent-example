const stripe = Stripe(
  "pk_test_51IcSDlJdBQrQaBlFQ7R37TxT0KgrFZ9X0B7duyTFw59ujLoov7pxWQtjOXiOq3cILWiNwwerHG9myui6ZlmLT2V600feCG3pR5"
);
const elements = stripe.elements();
const cardElement = elements.create("card");
const payBtn = document.getElementById("pay");
const addBtn = document.getElementById("add-btn");
const iframe3DS = document.getElementById("iframe");
cardElement.mount("#card-element");
let idPI = "";

// Listen callbacks
const channel3DS = new BroadcastChannel("3DS-authentication-complete");
function on3DSComplete(payment_intent_client_secret) {
  const messageLogger = document.getElementById("message");
  messageLogger.innerHTML = "";

  // Check the PaymentIntent
  stripe
    .retrievePaymentIntent(payment_intent_client_secret)
    .then(function (result) {
      console.log({ result });
      if (result.error) {
        // PaymentIntent client secret was invalid
        messageLogger.innerHTML = "<p style='color: red'>PaymentIntent client secret was invalid</p>"
      } else {
        if (result.paymentIntent.status === "succeeded") {
          // Show your customer that the payment has succeeded
          messageLogger.innerHTML = "<p style='color: green'>Confirm payment intent successfully</p>"
        } else if (result.paymentIntent.status === "requires_payment_method") {
          // Authentication failed, prompt the customer to enter another payment method
          messageLogger.innerHTML = "PaymentIntent failed"
        }
      }
    });
}

channel3DS.addEventListener("message", (event) => {
  // prevent other source put message
  if (event.origin === window.location.origin) {
    const payment_intent_client_secret = event.data;
    on3DSComplete(payment_intent_client_secret);
  }
});

function initializePayment() {
  return fetch("/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.text())
    .then(JSON.parse);
}

() => {
  fetch("/get-list-card")
    .then((res) => res.text())
    .then(JSON.parse);
};

addBtn.addEventListener("click", async () => {
  const token = await stripe.createToken(cardElement);
  fetch("/create-card", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
});

payBtn.addEventListener("click", async () => {
  const result = await initializePayment();
  if (result.next_action && result.next_action.type === "redirect_to_url") {
    idPI = result.id;
    window.open(
      result.next_action.redirect_to_url.url,
      "_blank",
      "location=yes,height=800,width=520,scrollbars=yes,status=yes"
    );
  }
});

// https://www.google.com.vn/?payment_intent=pi_1IcXikJdBQrQaBlFBilRLF51&payment_intent_client_secret=pi_1IcXikJdBQrQaBlFBilRLF51_secret_hvA5bsnfkE3tOqIYzBcy8dy4P&source_type=card
