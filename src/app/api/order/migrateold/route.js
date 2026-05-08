import mongoose from "mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import { connectDb } from "@/lib/dbConnect";

async function migrateOldOrderAddresses() {
  try {
    await connectDb();

    // Orders without deliveryAddress
    const orders = await Order.find({
      deliveryAddress: { $exists: false },
      user: { $ne: null },
    });

    console.log(`Found ${orders.length} old orders`);

    for (const order of orders) {
      try {
        const user = await User.findById(order.user);

        if (!user) continue;

        const defaultIndex = user.defaultAddress || 0;

        const selectedAddress =
          user.addresses?.[defaultIndex] || user.addresses?.[0];

        if (!selectedAddress) continue;

        order.deliveryAddress = {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country || "India",
          phone: user.number || "",
        };

        await order.save();

        console.log(`Updated order ${order._id}`);
      } catch (err) {
        console.log("Failed order:", order._id, err.message);
      }
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrateOldOrderAddresses();
