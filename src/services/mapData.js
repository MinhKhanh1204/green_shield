// Dữ liệu mẫu vùng nguyên liệu lục bình
// Dữ liệu tọa độ xung quanh khu vực Đồng bằng sông Cửu Long (Cần Thơ, Vĩnh Long, Hậu Giang)

export const materialZones = [
  {
    id: 'zone-1',
    name: 'Vùng Nguyên Liệu Cần Thơ',
    district: 'Phong Điền',
    area: 45,
    capacity: 120,
    status: 'active',
    center: [10.012, 105.623],
    polygon: [
      [10.0, 105.6],
      [10.025, 105.6],
      [10.025, 105.65],
      [10.0, 105.65]
    ]
  },
  {
    id: 'zone-2',
    name: 'Vùng Nguyên Liệu Vĩnh Long',
    district: 'Tam Bình',
    area: 38,
    capacity: 95,
    status: 'active',
    center: [10.082, 105.942],
    polygon: [
      [10.06, 105.92],
      [10.105, 105.92],
      [10.105, 105.965],
      [10.06, 105.965]
    ]
  },
  {
    id: 'zone-3',
    name: 'Vùng Nguyên Liệu Hậu Giang',
    district: 'Châu Thành A',
    area: 52,
    capacity: 145,
    status: 'active',
    center: [9.936, 105.482],
    polygon: [
      [9.91, 105.45],
      [9.96, 105.45],
      [9.96, 105.51],
      [9.91, 105.51]
    ]
  },
  {
    id: 'zone-4',
    name: 'Vùng Nguyên Liệu Đồng Tháp',
    district: 'Cao Lãnh',
    area: 30,
    capacity: 78,
    status: 'planning',
    center: [10.482, 105.627],
    polygon: [
      [10.46, 105.6],
      [10.505, 105.6],
      [10.505, 105.655],
      [10.46, 105.655]
    ]
  },
  {
    id: 'zone-5',
    name: 'Vùng Nguyên Liệu Tiền Giang',
    district: 'Cai Lậy',
    area: 28,
    capacity: 65,
    status: 'active',
    center: [10.395, 106.012],
    polygon: [
      [10.37, 105.98],
      [10.42, 105.98],
      [10.42, 106.045],
      [10.37, 106.045]
    ]
  }
];

export const farmerHouseholds = [
  {
    id: 'farmer-1',
    name: 'Nguyễn Văn A',
    phone: '0912 345 678',
    zoneId: 'zone-1',
    address: 'Ấp Thới Thuận, xã Thới Lai, huyện Phong Điền',
    capacity: 15,
    joinedDate: '2025-03-15',
    status: 'active',
    coordinates: [10.008, 105.631]
  },
  {
    id: 'farmer-2',
    name: 'Trần Thị B',
    phone: '0913 456 789',
    zoneId: 'zone-1',
    address: 'Ấp Thới Thuận, xã Thới Lai, huyện Phong Điền',
    capacity: 12,
    joinedDate: '2025-03-20',
    status: 'active',
    coordinates: [10.015, 105.628]
  },
  {
    id: 'farmer-3',
    name: 'Lê Văn C',
    phone: '0914 567 890',
    zoneId: 'zone-1',
    address: 'Ấp Thới Hòa, xã Thới Lai, huyện Phong Điền',
    capacity: 18,
    joinedDate: '2025-04-01',
    status: 'active',
    coordinates: [10.018, 105.635]
  },
  {
    id: 'farmer-4',
    name: 'Phạm Thị D',
    phone: '0915 678 901',
    zoneId: 'zone-2',
    address: 'Xã Mỹ Lộc, huyện Tam Bình',
    capacity: 10,
    joinedDate: '2025-04-10',
    status: 'active',
    coordinates: [10.075, 105.938]
  },
  {
    id: 'farmer-5',
    name: 'Ngô Văn E',
    phone: '0916 789 012',
    zoneId: 'zone-2',
    address: 'Xã Song Phú, huyện Tam Bình',
    capacity: 14,
    joinedDate: '2025-04-15',
    status: 'active',
    coordinates: [10.088, 105.945]
  },
  {
    id: 'farmer-6',
    name: 'Võ Thị F',
    phone: '0917 890 123',
    zoneId: 'zone-3',
    address: 'Xã Tân Hòa, huyện Châu Thành A',
    capacity: 20,
    joinedDate: '2025-05-01',
    status: 'active',
    coordinates: [9.928, 105.495]
  },
  {
    id: 'farmer-7',
    name: 'Đặng Văn G',
    phone: '0918 901 234',
    zoneId: 'zone-3',
    address: 'Xã Bảy Ngàn, huyện Châu Thành A',
    capacity: 16,
    joinedDate: '2025-05-10',
    status: 'active',
    coordinates: [9.942, 105.488]
  },
  {
    id: 'farmer-8',
    name: 'Lý Thị H',
    phone: '0919 012 345',
    zoneId: 'zone-3',
    address: 'Xã Thạnh Xuân, huyện Châu Thành A',
    capacity: 11,
    joinedDate: '2025-05-15',
    status: 'inactive',
    coordinates: [9.935, 105.505]
  },
  {
    id: 'farmer-9',
    name: 'Hoàng Văn I',
    phone: '0920 123 456',
    zoneId: 'zone-5',
    address: 'Xã Hiệp Đức, huyện Cai Lậy',
    capacity: 8,
    joinedDate: '2025-06-01',
    status: 'active',
    coordinates: [10.388, 106.008]
  },
  {
    id: 'farmer-10',
    name: 'Trương Thị K',
    phone: '0921 234 567',
    zoneId: 'zone-5',
    address: 'Xã Long Định, huyện Cai Lậy',
    capacity: 9,
    joinedDate: '2025-06-10',
    status: 'active',
    coordinates: [10.402, 106.018]
  }
];

export const collectionPoints = [
  {
    id: 'point-1',
    name: 'Điểm Thu Gom Thới Lai',
    zoneId: 'zone-1',
    address: 'Trung tâm Ấp Thới Thuận, xã Thới Lai, huyện Phong Điền, TP Cần Thơ',
    capacity: 50,
    currentStock: 32,
    manager: 'Nguyễn Văn Minh',
    phone: '0292 123 456',
    coordinates: [10.012, 105.623],
    status: 'active'
  },
  {
    id: 'point-2',
    name: 'Điểm Thu Gom Tam Bình',
    zoneId: 'zone-2',
    address: 'Chợ Tam Bình, huyện Tam Bình, tỉnh Vĩnh Long',
    capacity: 40,
    currentStock: 25,
    manager: 'Trần Văn Hùng',
    phone: '0270 234 567',
    coordinates: [10.082, 105.942],
    status: 'active'
  },
  {
    id: 'point-3',
    name: 'Điểm Thu Gom Châu Thành A',
    zoneId: 'zone-3',
    address: 'Khu vực Bến Tàu, xã Tân Hòa, huyện Châu Thành A, tỉnh Hậu Giang',
    capacity: 60,
    currentStock: 45,
    manager: 'Lê Thị Hương',
    phone: '0293 345 678',
    coordinates: [9.936, 105.482],
    status: 'active'
  },
  {
    id: 'point-4',
    name: 'Điểm Thu Gom Cai Lậy',
    zoneId: 'zone-5',
    address: 'Đường 30/4, thị trấn Cai Lậy, huyện Cai Lậy, tỉnh Tiền Giang',
    capacity: 35,
    currentStock: 18,
    manager: 'Phạm Văn Đức',
    phone: '0273 456 789',
    coordinates: [10.395, 106.012],
    status: 'active'
  },
  {
    id: 'point-5',
    name: 'Điểm Thu Gom Cao Lãnh',
    zoneId: 'zone-4',
    address: 'Kp Cao Lãnh, tỉnh Đồng Tháp',
    capacity: 30,
    currentStock: 0,
    manager: 'Ngô Thị Lan',
    phone: '0277 567 890',
    coordinates: [10.482, 105.627],
    status: 'planning'
  }
];

// Tổng hợp thống kê
export const getStats = () => {
  const totalZones = materialZones.length;
  const activeZones = materialZones.filter(z => z.status === 'active').length;
  const totalCapacity = materialZones.reduce((sum, z) => sum + z.capacity, 0);
  const totalFarmers = farmerHouseholds.length;
  const activeFarmers = farmerHouseholds.filter(f => f.status === 'active').length;
  const totalFarmerCapacity = farmerHouseholds.reduce((sum, f) => sum + f.capacity, 0);
  const totalCollectionPoints = collectionPoints.length;
  const activePoints = collectionPoints.filter(p => p.status === 'active').length;
  const totalStock = collectionPoints.reduce((sum, p) => sum + p.currentStock, 0);
  const totalStockCapacity = collectionPoints.reduce((sum, p) => sum + p.capacity, 0);

  return {
    totalZones,
    activeZones,
    totalCapacity,
    totalFarmers,
    activeFarmers,
    totalFarmerCapacity,
    totalCollectionPoints,
    activePoints,
    totalStock,
    totalStockCapacity
  };
};
