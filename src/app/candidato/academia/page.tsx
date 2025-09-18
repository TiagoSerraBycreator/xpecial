'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Video,
  Users,
  Clock,
  Star,
  Award,
  Play,
  Search,
  Filter,
  TrendingUp,
  Target,
  CheckCircle,
  ArrowRight,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  rating: number;
  students: number;
  category: string;
  thumbnail: string;
  progress?: number;
  isEnrolled?: boolean;
  price: number;
  tags: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  progress: number;
  category: string;
}

export default function AcademiaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('cursos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Fundamentos de React',
        description: 'Aprenda os conceitos básicos do React e construa suas primeiras aplicações.',
        instructor: 'João Silva',
        duration: '8h 30min',
        level: 'Iniciante',
        rating: 4.8,
        students: 1250,
        category: 'Desenvolvimento',
        thumbnail: '/api/placeholder/300/200',
        progress: 65,
        isEnrolled: true,
        price: 0,
        tags: ['React', 'JavaScript', 'Frontend']
      },
      {
        id: '2',
        title: 'Node.js Avançado',
        description: 'Domine técnicas avançadas de desenvolvimento backend com Node.js.',
        instructor: 'Maria Santos',
        duration: '12h 15min',
        level: 'Avançado',
        rating: 4.9,
        students: 890,
        category: 'Desenvolvimento',
        thumbnail: '/api/placeholder/300/200',
        price: 199,
        tags: ['Node.js', 'Backend', 'API']
      },
      {
        id: '3',
        title: 'Design Thinking para Desenvolvedores',
        description: 'Aprenda a aplicar metodologias de design thinking no desenvolvimento.',
        instructor: 'Carlos Oliveira',
        duration: '6h 45min',
        level: 'Intermediário',
        rating: 4.7,
        students: 650,
        category: 'Design',
        thumbnail: '/api/placeholder/300/200',
        price: 149,
        tags: ['Design', 'UX', 'Metodologia']
      }
    ];

    const mockPaths: LearningPath[] = [
      {
        id: '1',
        title: 'Desenvolvedor Full Stack',
        description: 'Trilha completa para se tornar um desenvolvedor full stack moderno.',
        courses: 8,
        duration: '40h',
        level: 'Iniciante a Avançado',
        progress: 25,
        category: 'Desenvolvimento'
      },
      {
        id: '2',
        title: 'UX/UI Designer',
        description: 'Aprenda design de interfaces e experiência do usuário.',
        courses: 6,
        duration: '30h',
        level: 'Iniciante a Intermediário',
        progress: 0,
        category: 'Design'
      }
    ];

    setCourses(mockCourses);
    setLearningPaths(mockPaths);
    setLoading(false);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'todos' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = ['todos', 'Desenvolvimento', 'Design', 'Marketing', 'Negócios'];
  const levels = ['todos', 'Iniciante', 'Intermediário', 'Avançado'];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Play className="h-12 w-12 text-white" />
        </div>
        {course.isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Matriculado
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            {course.rating}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">{course.instructor}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration}</span>
        </div>
        
        {course.isEnrolled && course.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progresso</span>
              <span className="text-gray-900 font-medium">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="text-right">
            {course.price === 0 ? (
              <span className="text-green-600 font-semibold">Gratuito</span>
            ) : (
              <span className="text-gray-900 font-semibold">R$ {course.price}</span>
            )}
          </div>
        </div>
        
        <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          {course.isEnrolled ? 'Continuar' : 'Matricular-se'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );

  const LearningPathCard = ({ path }: { path: LearningPath }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{path.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{path.description}</p>
        </div>
        <div className="ml-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{path.courses}</div>
          <div className="text-xs text-gray-500">Cursos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{path.duration}</div>
          <div className="text-xs text-gray-500">Duração</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{path.progress}%</div>
          <div className="text-xs text-gray-500">Progresso</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progresso da Trilha</span>
          <span className="text-gray-900 font-medium">{path.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${path.progress}%` }}
          ></div>
        </div>
      </div>
      
      <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
        {path.progress > 0 ? 'Continuar Trilha' : 'Iniciar Trilha'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando academia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <GraduationCap className="h-8 w-8 mr-3 text-blue-600" />
                  Academia Xpecial
                </h1>
                <p className="text-gray-600 mt-1">Desenvolva suas habilidades e acelere sua carreira</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold text-blue-900">3</div>
                  <div className="text-xs text-blue-700">Cursos Ativos</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-lg font-semibold text-green-900">2</div>
                  <div className="text-xs text-green-700">Certificados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8">
          <button
            onClick={() => setActiveTab('cursos')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cursos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Cursos
          </button>
          <button
            onClick={() => setActiveTab('trilhas')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'trilhas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            Trilhas de Aprendizado
          </button>
          <button
            onClick={() => setActiveTab('certificados')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'certificados'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="h-4 w-4 inline mr-2" />
            Certificados
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'cursos' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar cursos
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite o nome do curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'todos' ? 'Todas as categorias' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level === 'todos' ? 'Todos os níveis' : level}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'cursos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {activeTab === 'trilhas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map(path => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        )}

        {activeTab === 'certificados' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seus Certificados</h3>
            <p className="text-gray-600 mb-6">
              Complete cursos e trilhas para ganhar certificados e validar suas habilidades.
            </p>
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Explorar Cursos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}