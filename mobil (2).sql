-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 15, 2025 at 05:18 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mobil`
--

-- --------------------------------------------------------

--
-- Table structure for table `mobils`
--

CREATE TABLE `mobils` (
  `id` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `stok` int(11) DEFAULT NULL,
  `harga` int(11) DEFAULT NULL,
  `keterangan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mobils`
--

INSERT INTO `mobils` (`id`, `nama`, `stok`, `harga`, `keterangan`) VALUES
(1, 'Toyota', 10, 100000, 'Tidak Ada'),
(3, 'sodnuhdcwlc', 1111, 2147483647, 'okeee kali'),
(4, 'dnkd', 1, 1, 'ni dh paling ok'),
(5, 'Pajero', 11, 121, 'oke punya'),
(6, 'ri', 22, 21, 'fff'),
(7, 'Expander', 10, 800000, 'ni mantap'),
(8, 'Alphard', 10, 500000, 'harus'),
(9, 'Mini Cooper', 9, 900000, 'sewala'),
(10, 'Avanza', 80, 300000, 'bolela'),
(11, 'Mazda CX5', 10, 9200, 'iiw'),
(12, 'Baleno', 11, 21291, 'ok');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `itemId`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'Pending', '2025-01-14 18:41:31', '2025-01-14 18:41:31'),
(2, 1, 2, 'Approved', '2025-01-14 18:41:57', '2025-01-14 18:46:54'),
(3, 1, 1, 'Pending', '2025-01-14 18:46:44', '2025-01-14 18:46:44'),
(4, 5, 2, 'Pending', '2025-01-14 18:52:08', '2025-01-14 18:52:08'),
(5, 3, 2, 'Approved', '2025-01-14 19:05:13', '2025-01-14 19:05:37'),
(6, 1, 2, 'Rejected', '2025-01-14 19:13:57', '2025-01-14 19:14:25'),
(7, 11, 2, 'Approved', '2025-01-14 19:23:27', '2025-01-14 19:23:39'),
(8, 10, 2, 'Approved', '2025-01-14 19:25:43', '2025-01-14 20:18:36'),
(9, 12, 2, 'Approved', '2025-01-14 20:18:53', '2025-01-14 20:19:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'Admin', 'Admin', 'Admin'),
(2, 'User', 'User', 'User');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `mobils`
--
ALTER TABLE `mobils`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_item` (`itemId`),
  ADD KEY `fk_user` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `mobils`
--
ALTER TABLE `mobils`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `fk_item` FOREIGN KEY (`itemId`) REFERENCES `mobils` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
