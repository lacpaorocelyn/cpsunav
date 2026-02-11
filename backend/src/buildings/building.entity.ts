import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column()
  category: string;

  @Column('text')
  description: string;

  @Column()
  icon: string;
}
