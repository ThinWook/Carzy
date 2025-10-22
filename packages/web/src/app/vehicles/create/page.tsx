'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { endpoints } from '@/config/api'
import axios from 'axios'

interface User {
  _id: string;
  email: string;
  name?: string;
  kyc_status: string;
}

const schema = yup.object({
  title: yup.string().required('Tiêu đề rao bán là bắt buộc'),
  description: yup.string().required('Mô tả chi tiết là bắt buộc'),
  make: yup.string().required('Hãng xe là bắt buộc'),
  model: yup.string().required('Dòng xe là bắt buộc'),
  year: yup.number()
    .required('Năm sản xuất là bắt buộc')
    .min(2000, 'Năm sản xuất phải sau năm 2000')
    .max(new Date().getFullYear() + 1, 'Năm sản xuất không thể trong tương lai'),
  mileage: yup.number()
    .required('Số km đã đi là bắt buộc')
    .min(0, 'Số km đã đi phải là số dương'),
  body_type: yup.string()
    .oneOf(['Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Other', 
            'Xe số', 'Xe tay ga', 'Xe côn tay', 'Xe thể thao', 'Xe phân khối lớn'], 
           'Vui lòng chọn kiểu dáng hợp lệ'),
  fuel_type: yup.string()
    .oneOf(['Xăng', 'Dầu', 'Hybrid', 'Điện', 'LPG', 'Other'], 'Vui lòng chọn loại nhiên liệu hợp lệ'),
  transmission: yup.string()
    .oneOf(['Số sàn', 'Số tự động', 'CVT', 'Bán tự động', 'DCT', 'Other'], 'Vui lòng chọn hộp số hợp lệ'),
  engine_capacity: yup.string(),
  license_plate: yup.string(),
  vin: yup.string(),
  payload: yup.number().nullable(),
  price: yup.number()
    .required('Giá bán là bắt buộc')
    .min(0, 'Giá bán phải là số dương'),
  currency: yup.string().default('VND'),
  location: yup.string().required('Địa chỉ/Khu vực là bắt buộc'),
  images: yup.array().of(yup.string()),
  video_url: yup.string(),
  registration_papers: yup.string(),
  inspection_papers: yup.string(),
}).required()

type VehicleFormData = yup.InferType<typeof schema>

export default function CreateVehicle() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  
  // Kiểm tra xác thực và trạng thái KYC
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đăng tin')
      router.push('/login')
      return
    }
    
    // Kiểm tra trạng thái KYC
    if (user && user.kyc_status !== 'verified') {
      toast.error('Bạn cần xác thực KYC trước khi đăng tin bán xe')
      router.push('/profile/edit')
    }
  }, [isAuthenticated, user, router])
  
  // Vehicle type
  const [vehicleType, setVehicleType] = useState<string>('')
  
  // Form wizard steps
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5  // Increased from 4 to 5
  
  // Car brands and models
  const [availableModels, setAvailableModels] = useState<string[]>([])
  
  // Document uploads
  const [registrationDoc, setRegistrationDoc] = useState<string | null>(null)
  const [inspectionDoc, setInspectionDoc] = useState<string | null>(null)
  
  // Vehicle types
  const vehicleTypes = [
    { value: 'car', label: 'Ô tô' },
    { value: 'motorcycle', label: 'Xe máy' },
    { value: 'bicycle', label: 'Xe đạp' },
    { value: 'other', label: 'Khác' }
  ]
  
  // Car brands
  const carBrands = [
    { value: 'Toyota', label: 'Toyota' },
    { value: 'Honda', label: 'Honda' },
    { value: 'Ford', label: 'Ford' },
    { value: 'Hyundai', label: 'Hyundai' },
    { value: 'Kia', label: 'Kia' },
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
    { value: 'BMW', label: 'BMW' },
    { value: 'Audi', label: 'Audi' },
    { value: 'Mazda', label: 'Mazda' },
    { value: 'Nissan', label: 'Nissan' },
    { value: 'Mitsubishi', label: 'Mitsubishi' },
    { value: 'Vinfast', label: 'Vinfast' },
    { value: 'Other', label: 'Khác' },
  ]
  
  // Motorcycle brands
  const motorcycleBrands = [
    { value: 'Honda', label: 'Honda' },
    { value: 'Yamaha', label: 'Yamaha' },
    { value: 'Suzuki', label: 'Suzuki' },
    { value: 'SYM', label: 'SYM' },
    { value: 'Piaggio', label: 'Piaggio' },
    { value: 'Kawasaki', label: 'Kawasaki' },
    { value: 'Ducati', label: 'Ducati' },
    { value: 'BMW', label: 'BMW' },
    { value: 'Harley-Davidson', label: 'Harley-Davidson' },
    { value: 'Triumph', label: 'Triumph' },
    { value: 'Benelli', label: 'Benelli' },
    { value: 'KTM', label: 'KTM' },
    { value: 'VinFast', label: 'VinFast' },
    { value: 'Other', label: 'Khác' },
  ]
  
  // Truck brands
  const truckBrands = [
    { value: 'Isuzu', label: 'Isuzu' },
    { value: 'Hino', label: 'Hino' },
    { value: 'Hyundai', label: 'Hyundai' },
    { value: 'Kia', label: 'Kia' },
    { value: 'Thaco', label: 'Thaco' },
    { value: 'Mitsubishi', label: 'Mitsubishi' },
    { value: 'Ford', label: 'Ford' },
    { value: 'Dongfeng', label: 'Dongfeng' },
    { value: 'JAC', label: 'JAC' },
    { value: 'Veam', label: 'Veam' },
    { value: 'Other', label: 'Khác' },
  ]
  
  // Bicycle brands
  const bicycleBrands = [
    { value: 'Giant', label: 'Giant' },
    { value: 'Trek', label: 'Trek' },
    { value: 'Specialized', label: 'Specialized' },
    { value: 'Cannondale', label: 'Cannondale' },
    { value: 'Merida', label: 'Merida' },
    { value: 'Scott', label: 'Scott' },
    { value: 'Jett', label: 'Jett' },
    { value: 'Trinx', label: 'Trinx' },
    { value: 'Galaxy', label: 'Galaxy' },
    { value: 'Asama', label: 'Asama' },
    { value: 'Maruishi', label: 'Maruishi' },
    { value: 'Fornix', label: 'Fornix' },
    { value: 'Other', label: 'Khác' },
  ]
  
  // Location options
  const locationOptions = [
    'Tp Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 
    'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Quảng Ninh', 'Huế'
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      currency: 'VND',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  const selectedMake = watch('make')
  
  // Update models when make changes
  useEffect(() => {
    if (!selectedMake) {
      setAvailableModels([])
      return
    }
    
    // This would ideally fetch from an API, but for now we'll use static data
    const getModelsForMake = (make: string) => {
      const modelsByMake: Record<string, string[]> = {
        // Car models
        'Toyota': ['Camry', 'Corolla', 'RAV4', 'Vios', 'Fortuner', 'Innova', 'Land Cruiser'],
        'Ford': ['Ranger', 'Everest', 'EcoSport', 'Transit', 'Explorer'],
        'Hyundai': ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'i10', 'Kona'],
        'Kia': ['Cerato', 'Seltos', 'Sorento', 'Morning', 'Soluto'],
        'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLB'],
        'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7'],
        'Audi': ['A4', 'A6', 'Q5', 'Q7', 'A3', 'Q3'],
        'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-8', 'BT-50'],
        'Nissan': ['Navara', 'Terra', 'X-Trail', 'Sunny', 'Almera'],
        'Mitsubishi': ['Xpander', 'Outlander', 'Pajero Sport', 'Attrage', 'Triton'],
        'Vinfast': ['Lux A2.0', 'Lux SA2.0', 'Fadil', 'VF e34', 'VF 8', 'VF 9'],
        
        // Motorcycle models
        'Honda': vehicleType === 'car' 
          ? ['Civic', 'Accord', 'CR-V', 'City', 'HR-V', 'Brio']
          : ['Wave', 'Vision', 'Lead', 'SH', 'Winner', 'Air Blade', 'Future', 'Rebel', 'CB', 'CBR'],
        'Yamaha': ['Exciter', 'Sirius', 'Jupiter', 'NVX', 'Janus', 'Grande', 'MT', 'R15', 'R3', 'TFX'],
        'Suzuki': ['Raider', 'Impulse', 'Satria', 'GD', 'Address', 'GSX', 'Intruder', 'Hayabusa'],
        'SYM': ['Attila', 'Elite', 'Galaxy', 'Star', 'Fancy', 'Abela', 'Angela'],
        'Piaggio': ['Vespa', 'Liberty', 'Medley', 'Zip', 'Beverly', 'Fly', 'MP3'],
        'Kawasaki': ['Ninja', 'Z', 'Versys', 'Vulcan', 'W', 'KLX', 'KX'],
        'Ducati': ['Panigale', 'Monster', 'Multistrada', 'Scrambler', 'Diavel', 'XDiavel', 'Streetfighter'],
        'Harley-Davidson': ['Sportster', 'Softail', 'Touring', 'Street', 'Dyna', 'CVO'],
        'Triumph': ['Street Triple', 'Speed Triple', 'Bonneville', 'Thruxton', 'Tiger', 'Rocket'],
        'Benelli': ['TNT', 'TRK', 'Leoncino', '302', '502', '752'],
        'KTM': ['Duke', 'RC', 'Adventure', 'EXC', 'SX', 'SMC'],
        'VinFast': vehicleType === 'car'
          ? ['Lux A2.0', 'Lux SA2.0', 'Fadil', 'VF e34', 'VF 8', 'VF 9']
          : ['Klara', 'Feliz', 'Theon', 'Vento', 'Impes', 'Ludo'],
        
        // Bicycle models
        'Giant': ['ATX', 'Escape', 'Talon', 'TCR', 'Propel', 'Defy', 'Revolt'],
        'Trek': ['FX', 'Domane', 'Marlin', 'Émonda', 'Checkpoint', 'Madone', 'Powerfly'],
        'Specialized': ['Rockhopper', 'Allez', 'Diverge', 'Roubaix', 'Stumpjumper', 'Tarmac', 'Turbo'],
        'Cannondale': ['CAAD', 'SuperSix', 'Trail', 'Topstone', 'Synapse', 'Scalpel', 'Quick'],
        'Merida': ['Big Nine', 'Scultura', 'Big Trail', 'Silex', 'eSpeeder', 'Reacto', 'Crossway'],
        'Scott': ['Scale', 'Addict', 'Aspect', 'Speedster', 'Contessa', 'Spark', 'Genius'],
        'Jett': ['Cycle', 'Strada', 'Viper', 'Nitro', 'Rangers', 'Mach', 'Duke'],
        'Trinx': ['M100', 'M136', 'M500', 'M600', 'Free', 'Junior', 'X1'],
        'Galaxy': ['LP300', 'LP500', 'RL200', 'MT16', 'CT30', 'H2', 'TH19'],
        'Asama': ['AMT', 'TRK', 'MTB', 'CL', 'SW', 'VC', 'FCB'],
        'Maruishi': ['WH', 'AL', 'HB', 'MT', 'V7', 'P17', 'CR15'],
        'Fornix': ['BH802', 'FB20', 'M20', 'S20', 'X26', 'D100', 'MS50'],
        
        // Truck models - we'll keep these but they won't be displayed
        'Isuzu': ['D-Max', 'MU-X', 'QKR', 'VM', 'NPR', 'NQR', 'FTR'],
        'Hino': ['XZU', '300 Series', '500 Series', '700 Series'],
        'Thaco': ['Towner', 'Frontier', 'Ollin', 'Forland', 'Auman'],
        'JAC': ['X5', 'N200', 'N350', 'N800', 'N900'],
        'Veam': ['VT', 'HD', 'VPT', 'Bull', 'Motor'],
        'Dongfeng': ['Hoàng Huy', 'Trường Giang', 'K'],
      }
      
      return modelsByMake[make] || []
    }
    
    setAvailableModels(getModelsForMake(selectedMake))
  }, [selectedMake, vehicleType])

  // Update UI when vehicle type changes
  useEffect(() => {
    if (vehicleType) {
      // Reset make and model when vehicle type changes
      setValue('make', '');
      setValue('model', '');
      setAvailableModels([]);
    }
  }, [vehicleType, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      toast.loading('Đang tải lên hình ảnh...');
      
      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      // Tạo FormData để tải lên file
      const formData = new FormData();
      
      // Thêm từng file vào formData
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      // Gửi request tải lên đến API endpoint chuyên dụng
      const response = await axios.post(
        endpoints.vehicles.upload,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Lấy URLs từ phản hồi
      const uploadedUrls = response.data.urls;
      console.log('Uploaded image URLs:', uploadedUrls);
      
      // Thêm các URL mới vào state
      setImageUrls(prev => [...prev, ...uploadedUrls]);
      
      toast.dismiss();
      toast.success(`Đã tải lên ${uploadedUrls.length} hình ảnh thành công`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.dismiss();
      toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
  }
  
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'registration' | 'inspection') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      toast.loading(`Đang tải lên giấy tờ ${docType === 'registration' ? 'đăng ký' : 'đăng kiểm'}...`);
      
      // Lấy token xác thực
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      // Tạo FormData
      const formData = new FormData();
      formData.append('images', files[0]);
      
      // Upload tài liệu qua API
      const response = await axios.post(
        endpoints.vehicles.upload,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Lấy URL từ phản hồi
      const uploadedUrl = response.data.urls[0];
      console.log(`Uploaded ${docType} URL:`, uploadedUrl);
      
      // Cập nhật state và form value
      if (docType === 'registration') {
        setRegistrationDoc(uploadedUrl);
        setValue('registration_papers', uploadedUrl);
      } else {
        setInspectionDoc(uploadedUrl);
        setValue('inspection_papers', uploadedUrl);
      }
      
      toast.dismiss();
      toast.success('Tài liệu đã được tải lên thành công');
    } catch (error) {
      console.error('Document upload error:', error);
      toast.dismiss();
      toast.error('Không thể tải lên tài liệu. Vui lòng thử lại.');
    }
  }
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const onSubmit = async (data: VehicleFormData) => {
    // Check validation only for current step fields before proceeding
    try {
      // If not on the final step, validate current step and go to next step
      if (currentStep < totalSteps) {
        // Validate only fields in the current step
        let stepValid = true;
        
        if (currentStep === 1) {
          // Step 1: Vehicle Type validation
          if (!vehicleType) {
            toast.error('Vui lòng chọn loại phương tiện bạn muốn đăng bán!');
            stepValid = false;
          }
        } else if (currentStep === 2) {
          // Step 2: Basic Information validation
          if (!data.title || !data.description || !data.make || !data.model || !data.year) {
            toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
            stepValid = false;
          }
        } else if (currentStep === 3) {
          // Step 3: Technical Specifications validation
          if (vehicleType === 'car') {
            if (!data.mileage || !data.body_type || !data.fuel_type || !data.transmission) {
              toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
              stepValid = false;
            }
          } else if (vehicleType === 'motorcycle') {
            if (!data.mileage || !data.engine_capacity) {
              toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
              stepValid = false;
            }
            // Đảm bảo có giá trị cho body_type cho xe máy
            if (!data.body_type) {
              setValue('body_type', 'Xe số');
            }
            // Đặt giá trị mặc định cho trường không bắt buộc với xe máy
            setValue('fuel_type', 'Xăng');
            setValue('transmission', 'Số sàn');
          } else if (vehicleType === 'bicycle') {
            if (!data.body_type) {
              toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
              stepValid = false;
            }
            // Đặt giá trị mặc định cho các trường không bắt buộc với xe đạp
            setValue('mileage', 0);
            setValue('fuel_type', 'Other');
            setValue('transmission', 'Other');
          } else if (vehicleType === 'truck') {
            if (!data.mileage || !data.fuel_type || !data.payload) {
              toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
              stepValid = false;
            }
            // Đặt giá trị mặc định cho các trường không bắt buộc với xe tải
            setValue('body_type', 'Van');
            setValue('transmission', 'Số sàn');
          }
        } else if (currentStep === 4) {
          // Step 4: Price & Location validation
          if (!data.price || !data.location) {
            toast.error('Vui lòng điền đầy đủ thông tin giá và vị trí');
            stepValid = false;
          }
        }
        
        if (stepValid) {
          nextStep();
        }
        return;
      }
      
      console.log('Form submitted with data:', data);
      
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để đăng tin xe');
        router.push('/auth/login');
        return;
      }

      if (imageUrls.length === 0) {
        toast.error('Vui lòng tải lên ít nhất một hình ảnh');
        return;
      }

      setIsLoading(true);
      
      // Prepare data to send
      const vehicleData = {
        type: vehicleType,
        ...data,
        images: imageUrls.slice(0, 5), // Giới hạn chỉ 5 ảnh đầu tiên
      };
      
      // Nếu có giấy tờ, thêm vào (skip nếu không có để giảm kích thước request)
      if (registrationDoc) {
        vehicleData.registration_papers = registrationDoc;
      }
      
      if (inspectionDoc) {
        vehicleData.inspection_papers = inspectionDoc;
      }
      
      // Log data being sent
      console.log('Submitting vehicle data:', {
        ...vehicleData,
        images: `${vehicleData.images.length} images`,
        registration_papers: vehicleData.registration_papers ? 'Present' : 'Not provided',
        inspection_papers: vehicleData.inspection_papers ? 'Present' : 'Not provided'
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      // Check token
      console.log('Using token:', token.substring(0, 10) + '...');

      try {
        // Use axios instead of fetch
        const { data: responseData } = await axios.post(
          endpoints.vehicles.create, 
          vehicleData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            timeout: 60000, // Tăng timeout lên 60 giây vì có thể có nhiều ảnh
            maxContentLength: 50 * 1024 * 1024, // Giới hạn kích thước request 50MB
            maxBodyLength: 50 * 1024 * 1024, // Giới hạn kích thước body 50MB
          }
        );
        
        console.log('Server response:', responseData);
        
        // Hiển thị thông báo thành công
        toast.success(responseData.message || 'Đăng tin thành công');
        
        // Cập nhật hình ảnh riêng sau khi đã tạo xe cơ bản thành công
        if (responseData._id && imageUrls.length > 0) {
          try {
            // Tạm thời bỏ qua cập nhật hình ảnh để đảm bảo tạo xe thành công
            console.log('Skipping image update for now to ensure vehicle creation success');
            // Có thể sẽ thêm code cập nhật hình ảnh ở đây sau
          } catch (imageError) {
            console.error('Error updating images:', imageError);
            // Vẫn chuyển hướng vì xe đã tạo thành công
          }
        }
        
        // Chuyển hướng sau khi tạo thành công
        router.push('/my-vehicles');
      } catch (axiosError: any) {
        console.error('Axios error:', axiosError);
        
        // Xử lý lỗi chi tiết hơn
        if (axiosError.response) {
          // Server trả về response với status code nằm ngoài range 2xx
          const errorData = axiosError.response.data;
          const statusCode = axiosError.response.status;
          
          console.error(`Server error ${statusCode}:`, errorData);
          
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Hiển thị tất cả các lỗi validation
            errorData.errors.forEach((err: string) => {
              toast.error(err);
            });
          } else if (errorData.message) {
            toast.error(errorData.message);
          } else {
            toast.error(`Lỗi server (${statusCode})`);
          }
          
          // Nếu lỗi liên quan đến kích thước request quá lớn
          if (statusCode === 413 || (errorData.message && errorData.message.includes('size'))) {
            toast.error('Hình ảnh có kích thước quá lớn, vui lòng giảm số lượng hoặc kích thước ảnh');
          }
        } else if (axiosError.request) {
          // Request đã được gửi nhưng không nhận được response
          console.error('No response received:', axiosError.request);
          toast.error('Không nhận được phản hồi từ server');
        } else {
          // Lỗi khi thiết lập request
          toast.error('Lỗi khi gửi yêu cầu: ' + axiosError.message);
        }
        
        // Nếu lỗi liên quan đến kích thước request quá lớn
        if (axiosError.message && axiosError.message.includes('size')) {
          toast.error('Hình ảnh có kích thước quá lớn, vui lòng giảm số lượng hoặc kích thước ảnh');
        }
        
        throw new Error(axiosError.response?.data?.message || 'Không thể đăng tin');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể đăng tin');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Đăng tin bán xe
      </h1>
      
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  currentStep > index + 1 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index + 1 
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {currentStep > index + 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs mt-1">
                {index === 0 && 'Chọn loại xe'}
                {index === 1 && 'Thông tin cơ bản'}
                {index === 2 && 'Thông số kỹ thuật'}
                {index === 3 && 'Giá & Vị trí'}
                {index === 4 && 'Hình ảnh & Tài liệu'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(
        (data) => {
          console.log("Form submitted successfully", data);
          onSubmit(data);
        },
        (errors) => {
          console.error("Form validation errors:", errors);
          // If there are validation errors but we're just trying to go to next step, continue anyway
          if (currentStep < totalSteps) {
            nextStep();
          } else {
            toast.error('Vui lòng kiểm tra lại thông tin');
          }
        }
      )} className="mt-8 space-y-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Chọn loại phương tiện</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {vehicleTypes.map((type) => (
                <div 
                  key={type.value}
                  onClick={() => setVehicleType(type.value)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors text-center ${
                    vehicleType === type.value 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-24">
                    {type.value === 'car' && (
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 12h18v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-1zm0-3h18m-9-3v3" />
                      </svg>
                    )}
                    {type.value === 'motorcycle' && (
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18a2 2 0 11-4 0 2 2 0 014 0zm-8 0a2 2 0 11-4 0 2 2 0 014 0zm0-6h8m-4-5l4 5M5 4v2m0 0L2 9m3-3l3 3" />
                      </svg>
                    )}
                    {type.value === 'bicycle' && (
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2h-2m-6-6.5a2 2 0 100-4 2 2 0 000 4zM6 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                      </svg>
                    )}
                    {type.value === 'other' && (
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium text-gray-800">{type.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Thông tin cơ bản</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Tiêu đề rao bán
              </label>
              <input
                type="text"
                id="title"
                placeholder="Toyota Camry 2018, đi 50.000 km"
                {...register('title')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Mô tả chi tiết
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Mô tả tình trạng xe, lý do bán, thông tin bảo dưỡng, những nâng cấp thêm…"
                {...register('description')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Hãng xe
                </label>
                <select
                  id="make"
                  {...register('make')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Chọn hãng xe</option>
                  {(vehicleType === 'car' ? carBrands : 
                    vehicleType === 'motorcycle' ? motorcycleBrands :
                    vehicleType === 'bicycle' ? bicycleBrands : 
                    [...carBrands, ...motorcycleBrands, ...bicycleBrands].filter((v,i,a)=>a.findIndex(t=>(t.value===v.value))===i)
                  ).map((brand) => (
                    <option key={brand.value} value={brand.value}>
                      {brand.label}
                    </option>
                  ))}
                </select>
                {errors.make && (
                  <p className="mt-2 text-sm text-red-600">{errors.make.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Dòng xe
                </label>
                <select
                  id="model"
                  {...register('model')}
                  disabled={!selectedMake}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                >
                  <option value="">Chọn dòng xe</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {errors.model && (
                  <p className="mt-2 text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Năm sản xuất
                </label>
                <select
                  id="year"
                  {...register('year')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Chọn năm sản xuất</option>
                  {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
                {errors.year && (
                  <p className="mt-2 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Thông số kỹ thuật</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {vehicleType !== 'bicycle' && (
                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                    Số km đã đi
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="mileage"
                      {...register('mileage')}
                      placeholder="50000"
                      className="mt-1 block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">km</span>
                    </div>
                  </div>
                  {errors.mileage && (
                    <p className="mt-2 text-sm text-red-600">{errors.mileage.message}</p>
                  )}
                </div>
              )}
              
              {vehicleType === 'car' && (
                <>
                  <div>
                    <label htmlFor="body_type" className="block text-sm font-medium text-gray-700">
                      Kiểu dáng
                    </label>
                    <select
                      id="body_type"
                      {...register('body_type')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn kiểu dáng</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="MPV">MPV</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Wagon">Wagon</option>
                      <option value="Van">Van</option>
                      <option value="Other">Khác</option>
                    </select>
                    {errors.body_type && (
                      <p className="mt-2 text-sm text-red-600">{errors.body_type.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">
                      Loại nhiên liệu
                    </label>
                    <select
                      id="fuel_type"
                      {...register('fuel_type')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn loại nhiên liệu</option>
                      <option value="Xăng">Xăng</option>
                      <option value="Dầu">Dầu (Diesel)</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Điện">Điện</option>
                      <option value="LPG">LPG</option>
                      <option value="Other">Khác</option>
                    </select>
                    {errors.fuel_type && (
                      <p className="mt-2 text-sm text-red-600">{errors.fuel_type.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                      Hộp số
                    </label>
                    <select
                      id="transmission"
                      {...register('transmission')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn hộp số</option>
                      <option value="Số sàn">Số sàn</option>
                      <option value="Số tự động">Số tự động</option>
                      <option value="CVT">CVT</option>
                      <option value="Bán tự động">Bán tự động</option>
                      <option value="DCT">DCT</option>
                      <option value="Other">Khác</option>
                    </select>
                    {errors.transmission && (
                      <p className="mt-2 text-sm text-red-600">{errors.transmission.message}</p>
                    )}
                  </div>
                </>
              )}
              
              {vehicleType === 'motorcycle' && (
                <>
                  <div>
                    <label htmlFor="engine_capacity" className="block text-sm font-medium text-gray-700">
                      Dung tích động cơ
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="engine_capacity"
                        {...register('engine_capacity')}
                        placeholder="150"
                        className="mt-1 block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">cc</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="motorcycle_type" className="block text-sm font-medium text-gray-700">
                      Loại xe máy
                    </label>
                    <select
                      id="motorcycle_type"
                      {...register('body_type')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn loại xe máy</option>
                      <option value="Xe số">Xe số</option>
                      <option value="Xe tay ga">Xe tay ga</option>
                      <option value="Xe côn tay">Xe côn tay</option>
                      <option value="Xe thể thao">Xe thể thao</option>
                      <option value="Xe phân khối lớn">Xe phân khối lớn</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </>
              )}
              
              {vehicleType === 'bicycle' && (
                <>
                  <div>
                    <label htmlFor="bicycle_type" className="block text-sm font-medium text-gray-700">
                      Loại xe đạp
                    </label>
                    <select
                      id="bicycle_type"
                      {...register('body_type')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn loại xe đạp</option>
                      <option value="Đường phố">Đường phố</option>
                      <option value="Đua">Đua</option>
                      <option value="Địa hình">Địa hình (MTB)</option>
                      <option value="Gấp">Gấp</option>
                      <option value="Trẻ em">Trẻ em</option>
                      <option value="Fixgear">Fixgear</option>
                      <option value="Điện">Điện</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                      Kích thước khung
                    </label>
                    <select
                      id="size"
                      {...register('engine_capacity')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn kích thước</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="24">24"</option>
                      <option value="26">26"</option>
                      <option value="27.5">27.5"</option>
                      <option value="29">29"</option>
                      <option value="700c">700c</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                </>
              )}
              
              {vehicleType === 'truck' && (
                <>
                  <div>
                    <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">
                      Loại nhiên liệu
                    </label>
                    <select
                      id="fuel_type"
                      {...register('fuel_type')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Chọn loại nhiên liệu</option>
                      <option value="Xăng">Xăng</option>
                      <option value="Dầu">Dầu (Diesel)</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Điện">Điện</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="payload" className="block text-sm font-medium text-gray-700">
                      Tải trọng
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="payload"
                        {...register('payload')}
                        placeholder="1.5"
                        className="mt-1 block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">tấn</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {vehicleType !== 'bicycle' && (
                <div>
                  <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                    Biển số (tùy chọn)
                  </label>
                  <input
                    type="text"
                    id="license_plate"
                    {...register('license_plate')}
                    placeholder="51F-123.45"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
              
              {vehicleType === 'car' && (
                <div>
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                    Mã VIN (tùy chọn)
                  </label>
                  <input
                    type="text"
                    id="vin"
                    {...register('vin')}
                    placeholder="1HGCM82633A123456"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Giá bán & Vị trí</h2>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Giá bán
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="price"
                    {...register('price')}
                    placeholder="500000000"
                    className="mt-1 block w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">VNĐ</span>
                  </div>
                </div>
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Khu vực
                </label>
                <select
                  id="location"
                  {...register('location')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Chọn khu vực</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Hình ảnh & Tài liệu</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hình ảnh xe
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Tải lên hình ảnh</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">hoặc kéo thả vào đây</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF tối đa 10MB
                  </p>
                </div>
              </div>
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrls(urls => urls.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="registration_papers" className="block text-sm font-medium text-gray-700">
                  Giấy đăng ký xe (tùy chọn)
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="registration_papers"
                    accept="image/*,.pdf"
                    className="sr-only" 
                    onChange={(e) => handleDocUpload(e, 'registration')}
                  />
                  <label
                    htmlFor="registration_papers"
                    className="relative py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {registrationDoc ? 'Đã tải lên' : 'Tải lên giấy đăng ký'}
                  </label>
                  {registrationDoc && (
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationDoc(null)
                        setValue('registration_papers', '')
                      }}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="inspection_papers" className="block text-sm font-medium text-gray-700">
                  Giấy đăng kiểm (tùy chọn)
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="inspection_papers"
                    accept="image/*,.pdf"
                    className="sr-only" 
                    onChange={(e) => handleDocUpload(e, 'inspection')}
                  />
                  <label
                    htmlFor="inspection_papers"
                    className="relative py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {inspectionDoc ? 'Đã tải lên' : 'Tải lên giấy đăng kiểm'}
                  </label>
                  {inspectionDoc && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectionDoc(null)
                        setValue('inspection_papers', '')
                      }}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                  Link video giới thiệu (tùy chọn)
                </label>
                <input
                  type="text"
                  id="video_url"
                  {...register('video_url')}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-5">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md ${
              currentStep === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            }`}
          >
            Quay lại
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                console.log("Manual next step button clicked");
                // Manual validation for current step
                let canProceed = true;
                
                if (currentStep === 1) {
                  if (!vehicleType) {
                    toast.error('Vui lòng chọn loại phương tiện bạn muốn đăng bán!');
                    canProceed = false;
                  }
                } else if (currentStep === 2) {
                  const { title, description, make, model, year } = watch();
                  if (!title || !description || !make || !model || !year) {
                    toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
                    canProceed = false;
                  }
                } else if (currentStep === 3) {
                  if (vehicleType === 'car') {
                    const { mileage, body_type, fuel_type, transmission } = watch();
                    if (!mileage || !body_type || !fuel_type || !transmission) {
                      toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
                      canProceed = false;
                    }
                  } else if (vehicleType === 'motorcycle') {
                    const { mileage, engine_capacity } = watch();
                    if (!mileage || !engine_capacity) {
                      toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
                      canProceed = false;
                    }
                  } else if (vehicleType === 'bicycle') {
                    const { body_type } = watch();
                    if (!body_type) {
                      toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
                      canProceed = false;
                    }
                  } else if (vehicleType === 'truck') {
                    const { mileage, fuel_type, payload } = watch();
                    if (!mileage || !fuel_type || !payload) {
                      toast.error('Vui lòng điền đầy đủ thông số kỹ thuật');
                      canProceed = false;
                    }
                  }
                } else if (currentStep === 4) {
                  const { price, location } = watch();
                  if (!price || !location) {
                    toast.error('Vui lòng điền đầy đủ thông tin giá và vị trí');
                    canProceed = false;
                  }
                }
                
                if (canProceed) {
                  nextStep();
                }
              }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Tiếp tục
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng tin'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 