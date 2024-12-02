import React from 'react';
import { Button } from '@headlessui/react'
import Table from './Table';
import Upload from './Upload';
import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { modelState } from '../atom/modelState';
import * as XLSX from 'xlsx'
import moment from 'moment';

const Container = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [priceArry, setPriceArry] = useState([]);
    const models = useRecoilValue(modelState);


    const ipcHandle = () => {
        if (models.length === 0) {
            alert("선택된 모델이 없습니다. excel파일을 첨부해주세요.")
        } else {
            setIsLoading(true);
            window.electron.ipcRenderer.send('fetch-data', { models });
        }

    };

    useEffect(() => {
        window.electron.ipcRenderer.on("fetch-data-response", (event, args) => {
            setIsLoading(false);
            setPriceArry(args);
        })
    }, []);

    const exportExcel = () => {
        if (priceArry.length !== 0) {
            const worksheet = XLSX.utils.json_to_sheet(priceArry);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "sheet0");
            XLSX.writeFile(workbook, moment().format('YYYY-MM-DD') + ".xlsx");
        } else {
            alert("데이터가 없습니다.")
        }
        
    }


    return (
        <div className="container max-w-[90vw] mx-auto  mt-5">
            <div className="p-3 bg-slate-300 flex justify-between">
                <div>
                    <Button onClick={ipcHandle} className="mx-4 inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                        Start Crwaling
                    </Button>
                    <Upload />
                </div>
                <div>
                    <Button onClick={exportExcel} className="mx-4 inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                        Export to excel
                    </Button>
                </div>
            </div>


            <div className="mt-2">

                {
                    isLoading ? (
                        <div className="w-full h-[80vh] justify-center flex items-center">
                            <div
                                className="inline-block h-20 w-20 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                                role="status">
                            </div>
                        </div>
                    ) : (
                        priceArry.length !== 0 ?
                            <>
                                <Table data={priceArry} />
                            </>
                            : <>
                                <div>표시 할 데이터가 없습니다. 크롤링 버튼을 눌러주세요.</div>
                            </>

                    )
                }

            </div>
        </div>
    );
};

export default Container;