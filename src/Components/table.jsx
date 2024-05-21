"use client";
import React from "react";
import data from "./data.json";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Spinner, useDisclosure } from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import Modal from "./modal";

export default function Home() {

    const [yearlyData, setYearlyData] = React.useState({});
    const [aggregateData, setAggregateData] = React.useState([]);

    // Modal
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalData, setModalData] = React.useState({
        year: "",
        data: []
    });

    // function to process json data
    const processData = () => {
        const yearlyData = {};
        const yearlyRows = {};
        const formattedYearlyData = {};

        // Process each row
        data.forEach(item => {
            const year = item.work_year;
            item.salary_in_usd = parseInt(item.salary_in_usd);

            // Group data by year
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    jobCount: 0,
                    totalSalary: 0
                };
            }

            yearlyData[year].jobCount++;
            yearlyData[year].totalSalary += item.salary_in_usd;

            // Aggregate data by year and job title
            if (!yearlyRows[year]) {
                yearlyRows[year] = {};
            }

            if (!yearlyRows[year][item.job_title]) {
                yearlyRows[year][item.job_title] = {
                    jobCount: 0,
                    totalSalary: 0
                };
            }

            yearlyRows[year][item.job_title].jobCount++;
            yearlyRows[year][item.job_title].totalSalary += item.salary_in_usd;
        });

        // Format data for table and charts
        const formattedData = Object.keys(yearlyData).map(year => {
            let avg = (yearlyData[year].totalSalary / yearlyData[year].jobCount);
            return ({
                year,
                numberOfTotalJobs: yearlyData[year].jobCount,
                averageSalary: parseFloat(avg).toFixed(3) || avg
            })
        });

        Object.keys(yearlyRows).forEach(year => {
            formattedYearlyData[year] = Object.keys(yearlyRows[year]).map((job, idx) => {
                let avg = (yearlyRows[year][job].totalSalary / yearlyRows[year][job].jobCount);
                return ({
                    key: `${year}-${idx}`,
                    job,
                    jobCount: yearlyRows[year][job].jobCount,
                    averageSalary: parseFloat(avg).toFixed(3) || avg
                })
            })
        });

        setYearlyData(formattedYearlyData);
        setAggregateData(formattedData);
        return formattedData;
    };

    // State for loading
    const [isLoading, setIsLoading] = React.useState(true);

    // async list
    let list = useAsyncList({
        async load({ signal }) {
            const data = processData();
            setIsLoading(false);
            return {
                items: data,
            };
        },
        async sort({ items, sortDescriptor }) {
            return {
                items: items.sort((a, b) => {
                    let first = a[sortDescriptor.column];
                    let second = b[sortDescriptor.column];
                    let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }

                    return cmp;
                }),
            };
        },
    });

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} modalData={modalData} />
            <div className="flex h-full justify-center">
                <div className="flex flex-col container mt-5">
                    <h2 class="text-4xl font-extrabold dark:text-white mt-6 mb-3.5 text-center">Machine Learning Engineer Salary Analytics</h2>
                    <Table
                        selectionMode="single"
                        isHeaderSticky
                        aria-label="Jobs Data Table"
                        sortDescriptor={list.sortDescriptor}
                        onSortChange={list.sort}
                        classNames={{
                            table: "min-h-[400px]",
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="year" allowsSorting>
                                Year
                            </TableColumn>
                            <TableColumn key="numberOfTotalJobs" allowsSorting>
                                Total Jobs
                            </TableColumn>
                            <TableColumn key="averageSalary" allowsSorting>
                                Average Salary (USD)
                            </TableColumn>
                        </TableHeader>
                        <TableBody
                            items={list.items}
                            isLoading={isLoading}
                            loadingContent={<Spinner label="Loading..." />}
                        >
                            {(item) => (
                                <TableRow key={item.year} onClick={() => {
                                    setModalData({
                                        year: item.year,
                                        data: yearlyData[item.year]
                                    });
                                    onOpen();
                                }} style={{ cursor: "pointer" }}>
                                    {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <h2 class="text-2xl font-extrabold dark:text-white mt-6 mb-3.5">Graphs</h2>
                    <div className="flex flex-row justify-around w-full flex-wrap">
                        <LineChart width={730} height={300} data={aggregateData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis type="number" domain={[100000, 180000]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="averageSalary" stroke="#8884d8" />
                        </LineChart>

                        <LineChart width={730} height={300} data={aggregateData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="numberOfTotalJobs" stroke="#82ca9d" />
                        </LineChart>
                    </div>

                </div>
            </div>
        </>

    );
}