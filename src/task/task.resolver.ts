import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PaginatedTasksResponse } from '../dal/entity/pagination/paginatedResponse.helper';
import { PageableOptionsTasks } from '../dal/entity/pagination/sortOptionsInput.helper';
import { Project } from '../dal/entity/project.entity';
import { Task } from '../dal/entity/task.entity';
import { CreateTaskInput } from './dto/createTask-input';
import { CreateTaskDto } from './dto/createTaskDto';

import { TaskService } from './task.service';

@Resolver((of) => Task)
export class TaskResolver {
  constructor(private taskService: TaskService) {}

  @Query(() => [Task])
  async allTasks() {
    return this.taskService.findAll();
  }

  @Query(() => [Task])
  async allTasksLimit(
    @Args({ name: 'limit', type: () => Int }) limit: number,
  ): Promise<Task[]> {
    return this.taskService.findAllWithLimit(limit);
  }
  @Query(() => PaginatedTasksResponse)
  async paginatedTasks(
    @Args('pageableOptions', { nullable: true })
    PageableOptionsTasks?: PageableOptionsTasks,
  ): Promise<PaginatedTasksResponse> {
    const [items, total] = await this.taskService.getTasks(
      PageableOptionsTasks,
    );
    return {
      items,
      total,
    };
  }

  @Query(() => [Task])
  async allOrphanTasks(): Promise<Task[]> {
    return this.taskService.findAllOprhanedTasks();
  }
  @Query(() => Task)
  async findOneTaskById(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<Task> {
    return this.taskService.findOneById(id);
  }

  // This seems weird. without the if statement a project is always returned even if there is no supplied projectId
  @ResolveField((returns) => Project)
  project(@Parent() task: Task): Promise<Project> {
    if (task.projectId) {
      return this.taskService.getProject(task.projectId);
    } else return null;
  }

  @Mutation((returns) => Task)
  updateTask(
    @Args('createTaskDto') createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.updateTask(createTaskDto);
  }

  @Mutation((returns) => Task)
  createTask(
    @Args('createTaskDto') createTaskDto: CreateTaskInput,
  ): Promise<Task> {
    return this.taskService.createTask(createTaskDto);
  }
}
