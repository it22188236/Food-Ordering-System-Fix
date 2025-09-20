import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'promotion', 'system'],
    default: 'order'
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object
  }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);