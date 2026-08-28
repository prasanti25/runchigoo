-- RuchiGo food delivery platform database
-- MySQL 8.0+ | Generated from the supplied RuchiGo database specification.

DROP DATABASE IF EXISTS RuchiGo_DB;
CREATE DATABASE RuchiGo_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE RuchiGo_DB;

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) NOT NULL UNIQUE, description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE role_permissions (
  role_id INT NOT NULL, permission_id INT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(role_id,permission_id), FOREIGN KEY(role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY(permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT, role_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100), email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE, password_hash VARCHAR(255) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE, is_phone_verified BOOLEAN DEFAULT FALSE,
  account_status ENUM('Active','Inactive','Blocked','Pending') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(role_id) REFERENCES roles(role_id)
);
CREATE TABLE user_profiles (
  profile_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL UNIQUE,
  gender ENUM('Male','Female','Other'), date_of_birth DATE, profile_image VARCHAR(255),
  address TEXT, city VARCHAR(100), state VARCHAR(100), country VARCHAR(100), postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE login_history (
  login_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL, ip_address VARCHAR(45), device_type VARCHAR(100), browser VARCHAR(100),
  operating_system VARCHAR(100), login_status ENUM('Success','Failed') DEFAULT 'Success',
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE user_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255), login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE, device_name VARCHAR(100), ip_address VARCHAR(45),
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL UNIQUE, customer_code VARCHAR(20) UNIQUE,
  loyalty_points INT DEFAULT 0, total_orders INT DEFAULT 0, preferred_language VARCHAR(50),
  referral_code VARCHAR(30) UNIQUE, referred_by VARCHAR(30), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE customer_addresses (
  address_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL,
  address_type ENUM('Home','Work','Other') DEFAULT 'Home', contact_person VARCHAR(100), contact_phone VARCHAR(20),
  house_no VARCHAR(100), street VARCHAR(255), landmark VARCHAR(255), city VARCHAR(100), state VARCHAR(100),
  country VARCHAR(100), postal_code VARCHAR(20), latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  is_default BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE customer_wallets (
  wallet_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL UNIQUE, wallet_balance DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR', wallet_status ENUM('Active','Blocked','Closed') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);
CREATE TABLE customer_wallet_transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT, wallet_id INT NOT NULL, transaction_type ENUM('Credit','Debit') NOT NULL,
  amount DECIMAL(10,2) NOT NULL, transaction_reason VARCHAR(255), transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_number VARCHAR(100), FOREIGN KEY(wallet_id) REFERENCES customer_wallets(wallet_id) ON DELETE CASCADE
);

CREATE TABLE restaurant_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT, category_name VARCHAR(100) NOT NULL UNIQUE, description VARCHAR(255),
  category_image VARCHAR(255), status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE restaurants (
  restaurant_id INT PRIMARY KEY AUTO_INCREMENT, category_id INT NOT NULL, owner_id INT NOT NULL,
  restaurant_name VARCHAR(150) NOT NULL, restaurant_code VARCHAR(30) UNIQUE, email VARCHAR(150) UNIQUE, phone VARCHAR(20) UNIQUE,
  gst_number VARCHAR(30), fssai_license VARCHAR(50), description TEXT, logo VARCHAR(255), opening_date DATE,
  average_rating DECIMAL(2,1) DEFAULT 0, total_reviews INT DEFAULT 0, minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0, estimated_delivery_time INT, is_pure_veg BOOLEAN DEFAULT FALSE,
  status ENUM('Pending','Approved','Rejected','Closed','Active','Inactive') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES restaurant_categories(category_id), FOREIGN KEY(owner_id) REFERENCES users(user_id)
);
CREATE TABLE restaurant_addresses (
  address_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, building_name VARCHAR(150), street VARCHAR(255),
  landmark VARCHAR(255), city VARCHAR(100), state VARCHAR(100), country VARCHAR(100), postal_code VARCHAR(20),
  latitude DECIMAL(10,8), longitude DECIMAL(11,8), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE restaurant_hours (
  hour_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), opening_time TIME, closing_time TIME,
  is_closed BOOLEAN DEFAULT FALSE, FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE restaurant_documents (
  document_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL,
  document_type ENUM('GST','FSSAI','PAN','Aadhaar','Bank','Other'), document_number VARCHAR(100), document_file VARCHAR(255),
  verification_status ENUM('Pending','Verified','Rejected') DEFAULT 'Pending', uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE restaurant_statuses (
  status_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL,
  current_status ENUM('Open','Closed','Busy','Temporarily Closed') DEFAULT 'Closed', reason VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

CREATE TABLE food_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, category_name VARCHAR(100) NOT NULL,
  description VARCHAR(255), display_order INT DEFAULT 1, status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id,category_name), FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE food_items (
  food_item_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, category_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL, description TEXT, item_type ENUM('Veg','Non-Veg','Vegan','Egg') DEFAULT 'Veg',
  base_price DECIMAL(10,2) NOT NULL, preparation_time INT, calories INT, image_url VARCHAR(255), is_available BOOLEAN DEFAULT TRUE,
  is_recommended BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id), FOREIGN KEY(category_id) REFERENCES food_categories(category_id)
);
CREATE TABLE food_item_variants (
  variant_id INT PRIMARY KEY AUTO_INCREMENT, food_item_id INT NOT NULL, variant_name VARCHAR(100), price DECIMAL(10,2) NOT NULL,
  quantity VARCHAR(50), status ENUM('Available','Unavailable') DEFAULT 'Available',
  FOREIGN KEY(food_item_id) REFERENCES food_items(food_item_id) ON DELETE CASCADE
);
CREATE TABLE addon_categories (
  addon_category_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, category_name VARCHAR(100),
  is_required BOOLEAN DEFAULT FALSE, max_selection INT DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE addon_items (
  addon_item_id INT PRIMARY KEY AUTO_INCREMENT, addon_category_id INT NOT NULL, addon_name VARCHAR(100), price DECIMAL(10,2) DEFAULT 0,
  status ENUM('Available','Unavailable') DEFAULT 'Available',
  FOREIGN KEY(addon_category_id) REFERENCES addon_categories(addon_category_id) ON DELETE CASCADE
);

CREATE TABLE carts (
  cart_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL, restaurant_id INT NOT NULL, total_items INT DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0, tax_amount DECIMAL(10,2) DEFAULT 0, delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0, total_amount DECIMAL(10,2) DEFAULT 0,
  cart_status ENUM('Active','Ordered','Abandoned') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
  cart_item_id INT PRIMARY KEY AUTO_INCREMENT, cart_id INT NOT NULL, food_item_id INT NOT NULL, variant_id INT NULL,
  quantity INT NOT NULL DEFAULT 1, unit_price DECIMAL(10,2) NOT NULL, total_price DECIMAL(10,2) NOT NULL,
  special_instructions VARCHAR(255), added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE, FOREIGN KEY(food_item_id) REFERENCES food_items(food_item_id),
  FOREIGN KEY(variant_id) REFERENCES food_item_variants(variant_id) ON DELETE SET NULL
);
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT, order_number VARCHAR(30) NOT NULL UNIQUE, customer_id INT NOT NULL,
  restaurant_id INT NOT NULL, address_id INT NOT NULL, subtotal DECIMAL(10,2) NOT NULL, tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0, discount_amount DECIMAL(10,2) DEFAULT 0, total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  order_status ENUM('Placed','Accepted','Preparing','Ready','Out for Delivery','Delivered','Cancelled') DEFAULT 'Placed',
  special_instructions TEXT, ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id), FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id),
  FOREIGN KEY(address_id) REFERENCES customer_addresses(address_id)
);
CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, food_item_id INT NOT NULL, variant_id INT NULL,
  quantity INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL, total_price DECIMAL(10,2) NOT NULL, special_instruction VARCHAR(255),
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE, FOREIGN KEY(food_item_id) REFERENCES food_items(food_item_id),
  FOREIGN KEY(variant_id) REFERENCES food_item_variants(variant_id) ON DELETE SET NULL
);
CREATE TABLE order_status_history (
  status_history_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL,
  order_status ENUM('Placed','Accepted','Preparing','Ready','Out for Delivery','Delivered','Cancelled') NOT NULL,
  remarks VARCHAR(255), updated_by INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE, FOREIGN KEY(updated_by) REFERENCES users(user_id)
);

CREATE TABLE payment_methods (
  payment_method_id INT PRIMARY KEY AUTO_INCREMENT, method_name VARCHAR(50) NOT NULL UNIQUE, provider_name VARCHAR(100),
  description VARCHAR(255), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, payment_method_id INT NOT NULL, amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('Pending','Success','Failed','Refunded') DEFAULT 'Pending', payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_reference VARCHAR(100) UNIQUE, remarks VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE, FOREIGN KEY(payment_method_id) REFERENCES payment_methods(payment_method_id)
);
CREATE TABLE payment_transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT, payment_id INT NOT NULL, gateway_transaction_id VARCHAR(150) UNIQUE,
  gateway_name VARCHAR(100), transaction_type ENUM('Payment','Refund') DEFAULT 'Payment', amount DECIMAL(10,2) NOT NULL,
  transaction_status ENUM('Initiated','Success','Failed','Cancelled') DEFAULT 'Initiated', transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_code VARCHAR(50), response_message VARCHAR(255), FOREIGN KEY(payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);
CREATE TABLE invoices (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, payment_id INT NOT NULL, invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, customer_name VARCHAR(150) NOT NULL, billing_address TEXT, subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0, delivery_fee DECIMAL(10,2) DEFAULT 0, discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL, invoice_status ENUM('Generated','Paid','Cancelled') DEFAULT 'Generated',
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE, FOREIGN KEY(payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);

CREATE TABLE delivery_partners (
  delivery_partner_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL UNIQUE, partner_code VARCHAR(20) UNIQUE,
  vehicle_type ENUM('Bike','Scooter','Bicycle','Car') NOT NULL, driving_license_no VARCHAR(50) UNIQUE, aadhaar_no VARCHAR(20) UNIQUE,
  availability_status ENUM('Available','Busy','Offline') DEFAULT 'Offline', average_rating DECIMAL(2,1) DEFAULT 0,
  total_deliveries INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE delivery_vehicles (
  vehicle_id INT PRIMARY KEY AUTO_INCREMENT, delivery_partner_id INT NOT NULL, vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_model VARCHAR(100), vehicle_color VARCHAR(50), insurance_number VARCHAR(50), insurance_expiry DATE, rc_number VARCHAR(50),
  FOREIGN KEY(delivery_partner_id) REFERENCES delivery_partners(delivery_partner_id) ON DELETE CASCADE
);
CREATE TABLE delivery_assignments (
  assignment_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, delivery_partner_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, accepted_at DATETIME, picked_up_at DATETIME, delivered_at DATETIME,
  assignment_status ENUM('Assigned','Accepted','Picked Up','Delivered','Cancelled') DEFAULT 'Assigned',
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE, FOREIGN KEY(delivery_partner_id) REFERENCES delivery_partners(delivery_partner_id)
);
CREATE TABLE delivery_tracking (
  tracking_id INT PRIMARY KEY AUTO_INCREMENT, assignment_id INT NOT NULL, latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  location_name VARCHAR(255), tracking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tracking_status ENUM('Restaurant','Picked Up','In Transit','Delivered') DEFAULT 'Restaurant',
  FOREIGN KEY(assignment_id) REFERENCES delivery_assignments(assignment_id) ON DELETE CASCADE
);
CREATE TABLE delivery_earnings (
  earning_id INT PRIMARY KEY AUTO_INCREMENT, assignment_id INT NOT NULL, delivery_partner_id INT NOT NULL,
  order_amount DECIMAL(10,2), delivery_fee DECIMAL(10,2), incentive DECIMAL(10,2) DEFAULT 0, total_earning DECIMAL(10,2),
  payment_status ENUM('Pending','Paid') DEFAULT 'Pending', payment_date DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(assignment_id) REFERENCES delivery_assignments(assignment_id) ON DELETE CASCADE,
  FOREIGN KEY(delivery_partner_id) REFERENCES delivery_partners(delivery_partner_id)
);
CREATE TABLE restaurant_reviews (
  restaurant_review_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, customer_id INT NOT NULL, order_id INT NOT NULL,
  rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), review_title VARCHAR(150), review_text TEXT, is_anonymous BOOLEAN DEFAULT FALSE,
  review_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE, FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
CREATE TABLE food_item_reviews (
  food_review_id INT PRIMARY KEY AUTO_INCREMENT, food_item_id INT NOT NULL, customer_id INT NOT NULL, order_item_id INT NOT NULL,
  rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), review_title VARCHAR(150), review_text TEXT, is_recommended BOOLEAN DEFAULT TRUE,
  review_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(food_item_id) REFERENCES food_items(food_item_id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE, FOREIGN KEY(order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE
);

CREATE TABLE coupons (
  coupon_id INT PRIMARY KEY AUTO_INCREMENT, coupon_code VARCHAR(30) NOT NULL UNIQUE, coupon_name VARCHAR(100) NOT NULL, description VARCHAR(255),
  discount_type ENUM('Percentage','Flat') NOT NULL, discount_value DECIMAL(10,2) NOT NULL, minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2), start_date DATETIME NOT NULL, end_date DATETIME NOT NULL, usage_limit INT DEFAULT 0, used_count INT DEFAULT 0,
  status ENUM('Active','Inactive','Expired') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE coupon_usage (
  usage_id INT PRIMARY KEY AUTO_INCREMENT, coupon_id INT NOT NULL, customer_id INT NOT NULL, order_id INT NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL, used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(coupon_id,order_id),
  FOREIGN KEY(coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE, FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
CREATE TABLE notification_templates (
  template_id INT PRIMARY KEY AUTO_INCREMENT, template_name VARCHAR(100) NOT NULL UNIQUE,
  notification_type ENUM('Order','Payment','Delivery','Offer','Account','System') NOT NULL, title VARCHAR(150) NOT NULL,
  message_template TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, template_id INT,
  notification_type ENUM('Order','Payment','Delivery','Offer','Account','System') NOT NULL, title VARCHAR(150) NOT NULL, message TEXT NOT NULL,
  notification_channel ENUM('SMS','Email','Push','In-App') DEFAULT 'In-App', is_read BOOLEAN DEFAULT FALSE,
  sent_status ENUM('Pending','Sent','Failed') DEFAULT 'Pending', sent_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY(template_id) REFERENCES notification_templates(template_id) ON DELETE SET NULL
);
CREATE TABLE notification_preferences (
  preference_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL UNIQUE, order_notifications BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE, delivery_notifications BOOLEAN DEFAULT TRUE, offer_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE, sms_notifications BOOLEAN DEFAULT TRUE, push_notifications BOOLEAN DEFAULT TRUE,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
  admin_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL UNIQUE, admin_role ENUM('Super Admin','Manager','Support Admin') DEFAULT 'Manager',
  department VARCHAR(100), access_level INT DEFAULT 1, status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE restaurant_approvals (
  approval_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, admin_id INT, approval_status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  rejection_reason VARCHAR(255), approved_date DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE, FOREIGN KEY(admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);
CREATE TABLE restaurant_commissions (
  commission_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, order_id INT NOT NULL, order_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2) DEFAULT 0, commission_amount DECIMAL(10,2) DEFAULT 0, restaurant_earning DECIMAL(10,2) DEFAULT 0,
  settlement_status ENUM('Pending','Processed','Paid') DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE, FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
CREATE TABLE partner_payouts (
  payout_id INT PRIMARY KEY AUTO_INCREMENT, delivery_partner_id INT NOT NULL, total_deliveries INT DEFAULT 0,
  delivery_amount DECIMAL(10,2) DEFAULT 0, incentives DECIMAL(10,2) DEFAULT 0, penalties DECIMAL(10,2) DEFAULT 0,
  total_payout DECIMAL(10,2) DEFAULT 0, payout_status ENUM('Pending','Approved','Paid') DEFAULT 'Pending', payout_date DATE,
  FOREIGN KEY(delivery_partner_id) REFERENCES delivery_partners(delivery_partner_id) ON DELETE CASCADE
);
CREATE TABLE refunds (
  refund_id INT PRIMARY KEY AUTO_INCREMENT, order_id INT NOT NULL, payment_id INT NOT NULL, customer_id INT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL, refund_reason VARCHAR(255), refund_status ENUM('Requested','Approved','Rejected','Completed') DEFAULT 'Requested',
  refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY(payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE, FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE TABLE support_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT, category_name VARCHAR(100) NOT NULL UNIQUE, description VARCHAR(255),
  category_type ENUM('Order','Payment','Delivery','Restaurant','Account','Technical','Other') NOT NULL, status ENUM('Active','Inactive') DEFAULT 'Active'
);
CREATE TABLE support_tickets (
  ticket_id INT PRIMARY KEY AUTO_INCREMENT, ticket_number VARCHAR(30) NOT NULL UNIQUE, user_id INT NOT NULL, category_id INT NOT NULL,
  order_id INT NULL, subject VARCHAR(150) NOT NULL, description TEXT NOT NULL, priority ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
  ticket_status ENUM('Open','In Progress','Resolved','Closed') DEFAULT 'Open', assigned_admin_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY(category_id) REFERENCES support_categories(category_id),
  FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE SET NULL, FOREIGN KEY(assigned_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
);
CREATE TABLE ticket_messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT, ticket_id INT NOT NULL, sender_id INT NOT NULL,
  sender_type ENUM('Customer','Admin','Restaurant','Delivery Partner') NOT NULL, message TEXT NOT NULL, attachment_url VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE locations (
  location_id INT PRIMARY KEY AUTO_INCREMENT, address_line VARCHAR(255) NOT NULL, landmark VARCHAR(255), city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL, country VARCHAR(100) DEFAULT 'India', postal_code VARCHAR(20), latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  location_type ENUM('Customer','Restaurant','Delivery'), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE customer_locations (
  customer_location_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL, location_id INT NOT NULL, is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE, FOREIGN KEY(location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);
CREATE TABLE restaurant_locations (
  restaurant_location_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, location_id INT NOT NULL,
  delivery_radius_km DECIMAL(5,2), is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE, FOREIGN KEY(location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);
CREATE TABLE delivery_partner_locations (
  partner_location_id INT PRIMARY KEY AUTO_INCREMENT, delivery_partner_id INT NOT NULL, latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  current_address VARCHAR(255), availability_status ENUM('Available','Busy','Offline') DEFAULT 'Offline',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(delivery_partner_id) REFERENCES delivery_partners(delivery_partner_id) ON DELETE CASCADE
);
CREATE TABLE service_areas (
  service_area_id INT PRIMARY KEY AUTO_INCREMENT, area_name VARCHAR(150) NOT NULL, city VARCHAR(100) NOT NULL, postal_codes TEXT,
  latitude DECIMAL(10,8), longitude DECIMAL(11,8), service_status ENUM('Active','Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE search_history (
  search_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT NOT NULL, search_keyword VARCHAR(255) NOT NULL,
  search_type ENUM('Restaurant','Food Item','Category','Location') DEFAULT 'Restaurant', result_count INT DEFAULT 0, searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE favorite_restaurants (
  favorite_restaurant_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL, restaurant_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(customer_id,restaurant_id),
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE, FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE favorite_food_items (
  favorite_food_id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL, food_item_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(customer_id,food_item_id),
  FOREIGN KEY(customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE, FOREIGN KEY(food_item_id) REFERENCES food_items(food_item_id) ON DELETE CASCADE
);
CREATE TABLE inventory_items (
  inventory_item_id INT PRIMARY KEY AUTO_INCREMENT, restaurant_id INT NOT NULL, item_name VARCHAR(150) NOT NULL, item_category VARCHAR(100),
  unit_type ENUM('Kg','Gram','Liter','Piece','Packet') NOT NULL, minimum_stock_level DECIMAL(10,2) DEFAULT 0, maximum_stock_level DECIMAL(10,2),
  supplier_name VARCHAR(150), item_status ENUM('Active','Inactive') DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);
CREATE TABLE inventory_stock (
  stock_id INT PRIMARY KEY AUTO_INCREMENT, inventory_item_id INT NOT NULL, available_quantity DECIMAL(10,2) DEFAULT 0,
  reserved_quantity DECIMAL(10,2) DEFAULT 0, damaged_quantity DECIMAL(10,2) DEFAULT 0, expiry_date DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(inventory_item_id) ON DELETE CASCADE
);
CREATE TABLE inventory_transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT, inventory_item_id INT NOT NULL,
  transaction_type ENUM('Purchase','Sale','Usage','Return','Damage','Adjustment') NOT NULL, quantity DECIMAL(10,2) NOT NULL,
  reference_id INT, transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, remarks VARCHAR(255), created_by INT,
  FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(inventory_item_id) ON DELETE CASCADE, FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE system_settings (
  setting_id INT PRIMARY KEY AUTO_INCREMENT, setting_key VARCHAR(100) NOT NULL UNIQUE, setting_value TEXT NOT NULL,
  setting_type ENUM('Text','Number','Boolean','JSON') DEFAULT 'Text', description VARCHAR(255), status ENUM('Active','Inactive') DEFAULT 'Active',
  created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(created_by) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE tax_configurations (
  tax_id INT PRIMARY KEY AUTO_INCREMENT, tax_name VARCHAR(100) NOT NULL, tax_type ENUM('GST','Service Tax','Other') NOT NULL,
  tax_percentage DECIMAL(5,2) NOT NULL, applicable_on ENUM('Food','Delivery','Service','All') DEFAULT 'All', effective_from DATE, effective_to DATE,
  status ENUM('Active','Inactive') DEFAULT 'Active'
);
CREATE TABLE delivery_configurations (
  delivery_config_id INT PRIMARY KEY AUTO_INCREMENT, minimum_order_amount DECIMAL(10,2) DEFAULT 0, base_delivery_fee DECIMAL(10,2) DEFAULT 0,
  per_km_charge DECIMAL(10,2) DEFAULT 0, free_delivery_above DECIMAL(10,2), maximum_delivery_distance DECIMAL(5,2),
  estimated_delivery_time INT, surge_charge_percentage DECIMAL(5,2) DEFAULT 0, status ENUM('Active','Inactive') DEFAULT 'Active'
);

-- Performance indexes requested in the specification.
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_restaurant_name ON restaurants(restaurant_name);
CREATE INDEX idx_food_item_name ON food_items(item_name);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_coupon_code ON coupons(coupon_code);
CREATE INDEX idx_delivery_partner_id ON delivery_partners(delivery_partner_id);
CREATE INDEX idx_restaurant_city ON restaurant_addresses(city);

-- Master data from the supplied document.
INSERT INTO roles(role_name,description) VALUES
 ('Customer','Food ordering customer'),('Restaurant Owner','Restaurant management user'),
 ('Delivery Partner','Food delivery executive'),('Admin','System administrator'),('Support Staff','Customer support employee');
INSERT INTO restaurant_categories(category_name,description) VALUES
 ('South Indian','Traditional South Indian Food'),('North Indian','North Indian Cuisine'),('Fast Food','Burgers, Pizza and Snacks'),
 ('Chinese','Chinese and Asian Cuisine'),('Bakery','Cakes and Bakery Items'),('Beverages','Drinks and Juices'),('Desserts','Sweet Items');
INSERT INTO payment_methods(method_name,provider_name,description) VALUES
 ('Cash on Delivery','RuchiGo','Pay on delivery'),('UPI','UPI','Unified Payments Interface'),('Card','Gateway','Credit or debit card');
INSERT INTO tax_configurations(tax_name,tax_type,tax_percentage,applicable_on) VALUES ('GST','GST',5.00,'Food');
INSERT INTO delivery_configurations(minimum_order_amount,base_delivery_fee,per_km_charge,free_delivery_above,maximum_delivery_distance,estimated_delivery_time)
VALUES (0,30,5,499,15,35);
