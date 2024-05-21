"use client";
import React, { useEffect } from "react";
import { Modal, ModalContent, ModalHeader } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue, Spinner } from "@nextui-org/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { useAsyncList } from "@react-stately/data";
import { ModalData } from "./types";

interface AppProps {
    isOpen: boolean;
    onClose: () => void;
    modalData: ModalData;
}

const App: React.FC<AppProps> = ({ isOpen, onClose, modalData }) => {

    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState<any>([]);

    // Async List for sorting
    let list = useAsyncList({
        async load({ signal }) {
            setIsLoading(false);

            return {
                items: modalData.data,
            };
        },
        async sort({ items, sortDescriptor }) {
            return {
                items: items.sort((a, b) => {
                    // Anything can be sorted, so we need to use dynamic key access
                    // @ts-ignore: Ignore TypeScript error for dynamic key access
                    let first = a[sortDescriptor.column];
                    // @ts-ignore: Ignore TypeScript error for dynamic key access
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

    // Load data on modal open
    useEffect(() => {
        setIsLoading(true);
        setData(modalData.data);
        list.reload();
    }, [modalData]);

    return (
        <Modal
            size={"full"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Stats of {modalData.year}</ModalHeader>
                        <div className="flex h-full justify-center">
                            <div className="container">

                                {/* Table */}
                                <Table
                                    isHeaderSticky
                                    aria-label="Example table with client side sorting"
                                    sortDescriptor={list.sortDescriptor}
                                    onSortChange={list.sort}
                                    classNames={{
                                        base: "max-h-[50vh] overflowy-scroll",
                                    }}
                                >
                                    <TableHeader>
                                        <TableColumn key="job" allowsSorting>
                                            Job
                                        </TableColumn>
                                        <TableColumn key="jobCount" allowsSorting>
                                            Count
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
                                        {(item:any) => (
                                            <TableRow key={item.key}>
                                                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Bar Chart */}
                                <div className="chartContainer">
                                    <BarChart width={1400} height={350} data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} className="mt-12 mychart">
                                        <XAxis dataKey="job" />
                                        <YAxis domain={[0, 450000]} />
                                        <Tooltip />
                                        <Bar dataKey="averageSalary" fill="#8884d8" />
                                    </BarChart>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default App;