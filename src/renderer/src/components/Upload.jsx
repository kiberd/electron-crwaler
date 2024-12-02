import React, { useEffect } from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@headlessui/react'
import * as XLSX from 'xlsx';
import { useRecoilState } from 'recoil';
import { modelState } from '../atom/modelState';

const Upload = () => {


     
    const [uploadedFile, setUploadedFile] = useState();
    const [model, setModel] = useRecoilState(modelState);

     
    const handleDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
     
            const file = acceptedFiles[0];

            const reader = new FileReader();
     
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array", bookVBA: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                setUploadedFile({ file, jsonData });
            };

            reader.readAsArrayBuffer(file);
        }
    }, []);


    useEffect(() => {
        
        if (uploadedFile){
            const modelArry = [];
            const dataArry = uploadedFile.jsonData;

            dataArry.map((data, index) => {

                modelArry.push(data["model"]);
            });
            setModel(modelArry);

        }

    }, [uploadedFile]);


    return (
        <>
            {/* <Button className="mx-4 inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">모델명 업로드 (Excel)</Button> */}
            <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleDrop(e.target.files)}
            ></input>
        </>

    )
};

export default Upload;