import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './building.entity';

@Injectable()
export class BuildingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Building)
    private buildingsRepository: Repository<Building>,
  ) {}

  async onModuleInit() {
    const count = await this.buildingsRepository.count();
    if (count === 0) {
      await this.seedBuildings();
    }
  }

  findAll(): Promise<Building[]> {
    return this.buildingsRepository.find();
  }

  findOne(id: number): Promise<Building | null> {
    return this.buildingsRepository.findOne({ where: { id } });
  }

  async seedBuildings() {
    const buildingsData = [
      {
        name: 'Engineering Building',
        latitude: 9.849483976129486,
        longitude: 122.88873266985722,
        category: 'Academic',
        description:
          'Main building for the College of Engineering, featuring specialized labs and classrooms for all engineering disciplines.',
        icon: 'settings',
      },
      {
        name: 'Criminology Building',
        latitude: 9.850387233353889,
        longitude: 122.88930453759173,
        category: 'Academic',
        description:
          'The College of Criminal Justice Education (CCJE) building, providing facilities for the study and training of future law enforcement professionals.',
        icon: 'building-2',
      },
      {
        name: 'College of Business and Management',
        latitude: 9.851816656751671,
        longitude: 122.89028548885686,
        category: 'Academic',
        description:
          'Building for the College of Business and Management (CBM), focusing on business education, administration, and entrepreneurship.',
        icon: 'book-open',
      },
      {
        name: 'Administration Building',
        latitude: 9.852851169965508,
        longitude: 122.89046185580091,
        category: 'Administrative',
        description:
          'The central hub for campus administration, housing the principal offices, registrar, and other official services.',
        icon: 'building-2',
      },
      {
        name: 'CPSU Cafeteria',
        latitude: 9.853320032929346,
        longitude: 122.89095487677818,
        category: 'Services',
        description:
          'Main dining area providing various food and beverage options for students and staff members.',
        icon: 'utensils',
      },
      {
        name: 'Accreditation Center',
        latitude: 9.853786447276793,
        longitude: 122.89055908521105,
        category: 'Administrative',
        description:
          'The University Accreditation Center, dedicated to maintaining high educational standards and quality assurance for all campus programs.',
        icon: 'info',
      },
      {
        name: 'College of Arts and Sciences',
        latitude: 9.853358263630586,
        longitude: 122.88956960633499,
        category: 'Academic',
        description:
          'Building for the College of Arts and Sciences (CAS), providing a diverse range of programs in humanities, social sciences, and natural sciences.',
        icon: 'book-open',
      },
      {
        name: 'CPSU Mini Hotel',
        latitude: 9.851324383731624,
        longitude: 122.88897203870414,
        category: 'Services',
        description:
          'On-campus hotel facility providing accommodation services and a training ground for hospitality management students.',
        icon: 'bed',
      },
      {
        name: 'ROTC Office',
        latitude: 9.853159463885627,
        longitude: 122.88837059072797,
        category: 'Administrative',
        description:
          "Headquarters for the Reserve Officers' Training Corps (ROTC) unit on campus, managing student military training and leadership programs.",
        icon: 'shield',
      },
      {
        name: 'CPSU Gymnasium',
        latitude: 9.85353030177207,
        longitude: 122.88764885318288,
        category: 'Sports',
        description:
          'The primary venue for sports activities, physical education classes, and major university events and gatherings.',
        icon: 'dumbbell',
      },
      {
        name: 'Animal Science Building',
        latitude: 9.854027772114106,
        longitude: 122.88812404162148,
        category: 'Academic',
        description:
          'Specialized building for the study of animal sciences, featuring laboratories and classrooms for agriculture students.',
        icon: 'leaf',
      },
      {
        name: 'IT Department',
        latitude: 9.854358386635596,
        longitude: 122.88826100705529,
        category: 'Academic',
        description:
          'The Information Technology Department, housing computer labs and serving as the hub for tech-related studies.',
        icon: 'monitor',
      },
      {
        name: 'University Library',
        latitude: 9.854402650739477,
        longitude: 122.88926241098692,
        category: 'Academic',
        description:
          'The main university library, providing a vast collection of books, research materials, and quiet study spaces for students.',
        icon: 'book-open',
      },
      {
        name: 'COTED Department',
        latitude: 9.854456628587828,
        longitude: 122.89036155855534,
        category: 'Academic',
        description:
          'The College of Teacher Education (COTED) department, dedicated to training future educators and academic leaders.',
        icon: 'graduation-cap',
      },
      {
        name: 'College of Agriculture and Forestry',
        latitude: 9.854706275993783,
        longitude: 122.89084778584538,
        category: 'Academic',
        description:
          'The College of Agriculture and Forestry (CAF), focusing on sustainable farming, forestry management, and agricultural sciences.',
        icon: 'leaf',
      },
      {
        name: 'College of Agriculture',
        latitude: 9.850149717160772,
        longitude: 122.88824959679347,
        category: 'Academic',
        description:
          'Academic building focused on agricultural research, crop science, and sustainable farming practices.',
        icon: 'leaf',
      },
      {
        name: "Registrar's Office",
        latitude: 9.853129642291623,
        longitude: 122.89001735926348,
        category: 'Administrative',
        description:
          "The University Registrar's Office, responsible for managing student records, admissions, and ensuring smooth academic transitions for all students.",
        icon: 'graduation-cap',
      },
    ];

    for (const b of buildingsData) {
      const building = this.buildingsRepository.create(b);
      await this.buildingsRepository.save(building);
    }
    console.log('Seed: Buildings table populated.');
  }
}
