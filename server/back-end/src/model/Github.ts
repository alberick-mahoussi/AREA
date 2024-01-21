import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface GithubNewbranch{
    owner: string
    repository: string
    baseBranch: string
    NewBranchName: string
}

export interface GithubDeletebranch{
    owner: string
    repository: string
    Branchname: string
}

export interface GithubCreateIssue {
    owner: string;
    repository: string;
    title: string;
    body?: string;
    assignees?: string;
}

export interface GithubCloseIssue {
    owner: string;
    repository: string;
    title: string;
}

export interface GithubCreatePullRequest {
    Owner: string,
    repository: string,
    title?: string,
    body?: string,
    baseBranch: string, // branche cible (destination)
    headBranch: string, // branche source
}