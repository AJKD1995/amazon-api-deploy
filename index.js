const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const stripe = process.env.STRIPE_KEY
  ? require("stripe")(process.env.STRIPE_KEY)
  : null;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Success!",
  });
});

app.post("/payment/create", async (req, res) => {
  const total = Number.parseInt(req.query.total, 10);

  if (!Number.isInteger(total) || total <= 0) {
    return res.status(403).json({
      message: "Total must be greater than 0",
    });
  }

  if (!stripe) {
    return res.status(500).json({
      message: "Stripe is not configured. Set STRIPE_KEY in .env",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
    });

    return res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
