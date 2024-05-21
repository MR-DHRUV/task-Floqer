/*
 {
        "work_year": 2024,
        "experience_level": "MI",
        "employment_type": "FT",
        "job_title": "Data Scientist",
        "salary": 120000,
        "salary_currency": "USD",
        "salary_in_usd": 120000,
        "employee_residence": "AU",
        "remote_ratio": 0,
        "company_location": "AU",
        "company_size": "S"
    },

*/

export interface Data{
    work_year: number,
    experience_level: string,
    employment_type: string,
    job_title: string,
    salary: number,
    salary_currency: string,
    salary_in_usd: number,
    employee_residence: string,
    remote_ratio: number,
    company_location: string,
    company_size: string
}

export interface AggregateData {
    year: string,
    numberOfTotalJobs: number,
    averageSalary: number
}

export interface YearlyRows {
    [key: string]: {
        [key: string]: {
            jobCount: number,
            totalSalary: number
        }
    }
}

export interface YearlyData {
    [key: string]: {
        key: string,
        job: string,
        jobCount: number,
        averageSalary: string
    }[]
}

export interface ModalData {
    year: string,
    data: {
        key: string,
        job: string,
        jobCount: number,
        averageSalary: string
    }[]
}