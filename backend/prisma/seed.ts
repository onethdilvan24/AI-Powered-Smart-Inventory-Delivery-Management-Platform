import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role, SupplierStatus, StockStatus, OrderStatus, DeliveryStatus } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
  console.log('🌱 Seeding database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodflow.com' },
    update: {},
    create: { email: 'admin@foodflow.com', passwordHash: adminHash, name: 'Admin User', role: Role.ADMIN },
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@foodflow.com' },
    update: {},
    create: { email: 'manager@foodflow.com', passwordHash: adminHash, name: 'Sarah Johnson', role: Role.MANAGER },
  });
  console.log(`  ✓ Users: ${admin.email}, ${manager.email}`);

  // ── Suppliers ─────────────────────────────────────────────────────────────
  const s1 = await prisma.supplier.upsert({
    where: { email: 'john@freshfarms.com' },
    update: {},
    create: {
      name: 'Fresh Farms Co.', category: 'Vegetables & Fruits', contact: 'John Carter',
      email: 'john@freshfarms.com', phone: '+1 (555) 201-3344',
      status: SupplierStatus.ACTIVE, performanceScore: 4.8, totalOrders: 142,
      onTimeDelivery: 96, lastDelivery: 'Today', address: '12 Orchard Lane, Springfield',
    },
  });
  const s2 = await prisma.supplier.upsert({
    where: { email: 'maria@dairybest.com' },
    update: {},
    create: {
      name: 'Dairy Best Ltd.', category: 'Dairy & Eggs', contact: 'Maria Stevens',
      email: 'maria@dairybest.com', phone: '+1 (555) 402-7788',
      status: SupplierStatus.ACTIVE, performanceScore: 4.5, totalOrders: 98,
      onTimeDelivery: 92, lastDelivery: 'Yesterday', address: '8 Milk Road, Lakewood',
    },
  });
  const s3 = await prisma.supplier.upsert({
    where: { email: 'carlos@meatmasters.com' },
    update: {},
    create: {
      name: 'Meat Masters', category: 'Meat & Poultry', contact: 'Carlos Mendes',
      email: 'carlos@meatmasters.com', phone: '+1 (555) 609-5512',
      status: SupplierStatus.ACTIVE, performanceScore: 4.7, totalOrders: 115,
      onTimeDelivery: 94, lastDelivery: '2 days ago', address: '55 Butcher Street, Riverside',
    },
  });
  const s4 = await prisma.supplier.upsert({
    where: { email: 'priya@oceanfresh.com' },
    update: {},
    create: {
      name: 'Ocean Fresh Co.', category: 'Seafood', contact: 'Priya Nair',
      email: 'priya@oceanfresh.com', phone: '+1 (555) 307-9920',
      status: SupplierStatus.ACTIVE, performanceScore: 4.3, totalOrders: 67,
      onTimeDelivery: 88, lastDelivery: '3 days ago', address: '3 Harbor View, Port City',
    },
  });
  const s5 = await prisma.supplier.upsert({
    where: { email: 'ahmed@grainworld.com' },
    update: {},
    create: {
      name: 'Grain World', category: 'Grains & Pasta', contact: 'Ahmed Hassan',
      email: 'ahmed@grainworld.com', phone: '+1 (555) 501-6634',
      status: SupplierStatus.ACTIVE, performanceScore: 4.6, totalOrders: 53,
      onTimeDelivery: 97, lastDelivery: '5 days ago', address: '101 Warehouse Blvd, Milltown',
    },
  });
  const s6 = await prisma.supplier.upsert({
    where: { email: 'sofia@medgoods.com' },
    update: {},
    create: {
      name: 'Mediterranean Goods', category: 'Oils & Condiments', contact: 'Sofia Almeida',
      email: 'sofia@medgoods.com', phone: '+1 (555) 703-2211',
      status: SupplierStatus.INACTIVE, performanceScore: 3.9, totalOrders: 28,
      onTimeDelivery: 78, lastDelivery: '2 weeks ago', address: '9 Olive Grove, Sunset Bay',
    },
  });
  console.log('  ✓ Suppliers (6)');

  // ── Products ──────────────────────────────────────────────────────────────
  const productsData = [
    { name: 'Chicken Breast', category: 'Poultry', quantity: 12, unit: 'kg', minStock: 20, expiryDate: new Date('2026-06-02'), costPerUnit: 8.5, status: StockStatus.LOW, supplierId: s3.id },
    { name: 'Atlantic Salmon', category: 'Seafood', quantity: 8, unit: 'kg', minStock: 15, expiryDate: new Date('2026-05-31'), costPerUnit: 14.0, status: StockStatus.CRITICAL, supplierId: s4.id },
    { name: 'Roma Tomatoes', category: 'Vegetables', quantity: 4, unit: 'kg', minStock: 10, expiryDate: new Date('2026-06-01'), costPerUnit: 2.5, status: StockStatus.CRITICAL, supplierId: s1.id },
    { name: 'Whole Milk', category: 'Dairy', quantity: 60, unit: 'L', minStock: 20, expiryDate: new Date('2026-06-05'), costPerUnit: 1.2, status: StockStatus.OK, supplierId: s2.id },
    { name: 'Boliar Chicken', category: 'Poultry', quantity: 10, unit: 'kg', minStock: 15, expiryDate: new Date('2026-06-03'), costPerUnit: 7.8, status: StockStatus.LOW, supplierId: s3.id },
    { name: 'Basmati Rice', category: 'Grains', quantity: 120, unit: 'kg', minStock: 30, expiryDate: new Date('2027-01-01'), costPerUnit: 1.8, status: StockStatus.OK, supplierId: s5.id },
    { name: 'Olive Oil', category: 'Condiments', quantity: 18, unit: 'L', minStock: 10, expiryDate: new Date('2026-12-15'), costPerUnit: 9.0, status: StockStatus.OK, supplierId: s6.id },
    { name: 'Rui Fish', category: 'Seafood', quantity: 10, unit: 'kg', minStock: 12, expiryDate: new Date('2026-05-30'), costPerUnit: 5.5, status: StockStatus.LOW, supplierId: s4.id },
    { name: 'Heavy Cream', category: 'Dairy', quantity: 3, unit: 'L', minStock: 10, expiryDate: new Date('2026-05-29'), costPerUnit: 3.5, status: StockStatus.EXPIRED, supplierId: s2.id },
    { name: 'Cheddar Cheese', category: 'Dairy', quantity: 25, unit: 'kg', minStock: 8, expiryDate: new Date('2026-07-10'), costPerUnit: 11.0, status: StockStatus.OK, supplierId: s2.id },
    { name: 'Garlic', category: 'Vegetables', quantity: 15, unit: 'kg', minStock: 5, expiryDate: new Date('2026-06-20'), costPerUnit: 3.0, status: StockStatus.OK, supplierId: s1.id },
    { name: 'Pasta (Penne)', category: 'Grains', quantity: 80, unit: 'kg', minStock: 20, expiryDate: new Date('2027-03-01'), costPerUnit: 2.2, status: StockStatus.OK, supplierId: s5.id },
    { name: 'Ground Beef', category: 'Meat', quantity: 5, unit: 'kg', minStock: 15, expiryDate: new Date('2026-06-01'), costPerUnit: 10.5, status: StockStatus.CRITICAL, supplierId: s3.id },
    { name: 'Spinach', category: 'Vegetables', quantity: 2, unit: 'kg', minStock: 5, expiryDate: new Date('2026-05-30'), costPerUnit: 4.0, status: StockStatus.EXPIRED, supplierId: s1.id },
    { name: 'Eggs (Free Range)', category: 'Dairy', quantity: 200, unit: 'pcs', minStock: 60, expiryDate: new Date('2026-06-08'), costPerUnit: 0.4, status: StockStatus.OK, supplierId: s1.id },
  ];
  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.name + '-seed' },
      update: {},
      create: { id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-seed', ...p },
    });
  }
  console.log(`  ✓ Products (${productsData.length})`);

  // ── Orders ────────────────────────────────────────────────────────────────
  const o1 = await prisma.order.upsert({
    where: { orderNumber: '#253200' },
    update: {},
    create: {
      orderNumber: '#253200', supplierId: s1.id, status: OrderStatus.PENDING,
      expectedDelivery: new Date('2026-05-30'), total: 80.0, notes: 'Urgent restock needed.',
      items: { create: [
        { productName: 'Roma Tomatoes', quantity: 20, unit: 'kg', unitPrice: 2.5 },
        { productName: 'Garlic', quantity: 10, unit: 'kg', unitPrice: 3.0 },
      ]},
    },
  });
  const o2 = await prisma.order.upsert({
    where: { orderNumber: '#253201' },
    update: {},
    create: {
      orderNumber: '#253201', supplierId: s3.id, status: OrderStatus.PENDING,
      expectedDelivery: new Date('2026-05-31'), total: 412.5,
      items: { create: [
        { productName: 'Chicken Breast', quantity: 30, unit: 'kg', unitPrice: 8.5 },
        { productName: 'Ground Beef', quantity: 15, unit: 'kg', unitPrice: 10.5 },
      ]},
    },
  });
  const o3 = await prisma.order.upsert({
    where: { orderNumber: '#253198' },
    update: {},
    create: {
      orderNumber: '#253198', supplierId: s2.id, status: OrderStatus.OUT_FOR_DELIVERY,
      expectedDelivery: new Date('2026-05-29'), total: 340.0,
      items: { create: [
        { productName: 'Whole Milk', quantity: 100, unit: 'L', unitPrice: 1.2 },
        { productName: 'Cheddar Cheese', quantity: 20, unit: 'kg', unitPrice: 11.0 },
      ]},
    },
  });
  const o4 = await prisma.order.upsert({
    where: { orderNumber: '#253197' },
    update: {},
    create: {
      orderNumber: '#253197', supplierId: s4.id, status: OrderStatus.PACKED,
      expectedDelivery: new Date('2026-05-30'), total: 280.0,
      items: { create: [{ productName: 'Atlantic Salmon', quantity: 20, unit: 'kg', unitPrice: 14.0 }] },
    },
  });
  await prisma.order.upsert({
    where: { orderNumber: '#253190' },
    update: {},
    create: {
      orderNumber: '#253190', supplierId: s1.id, status: OrderStatus.DELIVERED,
      expectedDelivery: new Date('2026-05-24'), total: 192.0,
      items: { create: [
        { productName: 'Eggs (Free Range)', quantity: 400, unit: 'pcs', unitPrice: 0.4 },
        { productName: 'Spinach', quantity: 8, unit: 'kg', unitPrice: 4.0 },
      ]},
    },
  });
  await prisma.order.upsert({
    where: { orderNumber: '#253185' },
    update: {},
    create: {
      orderNumber: '#253185', supplierId: s5.id, status: OrderStatus.DELIVERED,
      expectedDelivery: new Date('2026-05-20'), total: 580.0,
      items: { create: [
        { productName: 'Basmati Rice', quantity: 200, unit: 'kg', unitPrice: 1.8 },
        { productName: 'Pasta (Penne)', quantity: 100, unit: 'kg', unitPrice: 2.2 },
      ]},
    },
  });
  await prisma.order.upsert({
    where: { orderNumber: '#253202' },
    update: {},
    create: {
      orderNumber: '#253202', supplierId: s2.id, status: OrderStatus.PENDING,
      expectedDelivery: new Date('2026-06-01'), total: 70.0,
      items: { create: [{ productName: 'Heavy Cream', quantity: 20, unit: 'L', unitPrice: 3.5 }] },
    },
  });
  console.log('  ✓ Orders (7)');

  // ── Drivers ───────────────────────────────────────────────────────────────
  const d1 = await prisma.driver.upsert({
    where: { licensePlate: 'TRK-4821' },
    update: {},
    create: { name: 'James Wilson', phone: '+1 (555) 881-2230', vehicle: 'Ford Transit Refrigerated', licensePlate: 'TRK-4821' },
  });
  const d2 = await prisma.driver.upsert({
    where: { licensePlate: 'VAN-7732' },
    update: {},
    create: { name: 'Sandra Lee', phone: '+1 (555) 770-4456', vehicle: 'Mercedes Sprinter', licensePlate: 'VAN-7732' },
  });
  const d3 = await prisma.driver.upsert({
    where: { licensePlate: 'RFR-9001' },
    update: {},
    create: { name: 'Mike Thompson', phone: '+1 (555) 992-8811', vehicle: 'Isuzu NQR Reefer', licensePlate: 'RFR-9001' },
  });
  const d4 = await prisma.driver.upsert({
    where: { licensePlate: 'FRZ-6610' },
    update: {},
    create: { name: 'Raj Patel', phone: '+1 (555) 661-3390', vehicle: 'Ford F-350 Refrigerated', licensePlate: 'FRZ-6610' },
  });
  console.log('  ✓ Drivers (4)');

  // ── Deliveries ────────────────────────────────────────────────────────────
  await prisma.delivery.upsert({
    where: { orderId: o3.id },
    update: {},
    create: {
      orderId: o3.id, driverId: d1.id, status: DeliveryStatus.IN_TRANSIT,
      originLat: 6.9271, originLng: 79.8612, originLabel: 'Dairy Best Ltd. Warehouse',
      destinationLat: 6.9344, destinationLng: 79.8428, destinationLabel: 'FoodFlow Restaurant Hub',
      currentLat: 6.9300, currentLng: 79.8530,
      eta: '35 min', distance: '8.2 km', startedAt: '09:15 AM', customerName: 'FoodFlow Restaurant Hub',
    },
  });
  await prisma.delivery.upsert({
    where: { orderId: o4.id },
    update: {},
    create: {
      orderId: o4.id, driverId: d2.id, status: DeliveryStatus.SCHEDULED,
      originLat: 6.8942, originLng: 79.8554, originLabel: 'Ocean Fresh Co. Port Facility',
      destinationLat: 6.9271, destinationLng: 79.8612, destinationLabel: 'Downtown Kitchen Collective',
      currentLat: 6.8942, currentLng: 79.8554,
      eta: '2 hr 20 min', distance: '14.5 km', startedAt: '11:00 AM', customerName: 'Downtown Kitchen Collective',
    },
  });
  await prisma.delivery.upsert({
    where: { orderId: o2.id },
    update: {},
    create: {
      orderId: o2.id, driverId: d4.id, status: DeliveryStatus.DELAYED,
      originLat: 6.9100, originLng: 79.8700, originLabel: 'Meat Masters Processing Plant',
      destinationLat: 6.9271, destinationLng: 79.8612, destinationLabel: 'Grand Hotel Kitchen',
      currentLat: 6.9180, currentLng: 79.8660,
      eta: '1 hr 10 min (delayed)', distance: '6.8 km', startedAt: '08:45 AM', customerName: 'Grand Hotel Kitchen',
    },
  });
  console.log('  ✓ Deliveries (3)');

  console.log('\n✅ Seed complete!');
  console.log('   admin@foodflow.com   / password123  (ADMIN)');
  console.log('   manager@foodflow.com / password123  (MANAGER)');
}

main()
  .catch(err => { console.error('Seed failed:', err); process.exit(1); })
  .finally(() => (prisma as unknown as { $disconnect: () => Promise<void> }).$disconnect());
