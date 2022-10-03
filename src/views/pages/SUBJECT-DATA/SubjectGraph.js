import { CCol, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Loader } from 'src/reusable/index';
import { getSubjectDetailsoftrial } from '../../../services/AppService';
import GraphCard from './GraphCard';
import './SubjectGraph.scss';

const SubjectGraph = () => {
  const _params = useParams();
  const masterData = useSelector((store) => store.dataReducer.data);
  const [trialsbysubject, settrialsbysubject] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [activeGraphCards, setGraphCards] = useState({});

  const getSubjectDetailsoftrialfunc = async () => {
    try {
      setLoading(true);
      const trialdetail = await getSubjectDetailsoftrial(
        masterData,
        _params.subjectid,
      );
      const resp = trialdetail.data.data;
      const subjectname = resp.map((e) => {
        return e.name;
      });

      const trialdata = resp.map((e, i) => {
        return {
          value: `${e.trial.id}`,
          label: `${e.trial.name}`,
          subjectname: `${e.name}`,
          expname: `${e.subject.experiment.name}`,
        };
      });

      settrialsbysubject(trialdata);

      setSelectedValues(trialdata.filter((e) => e.value === _params.trialid));
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const getGraphCardList = () => {
  //   let cards = {};
  //   let keyList = Object.keys(activeGraphCards);
  //   keyList.map((key) => {
  //     let ind = selectedValues.findIndex((e) => e.value === key);
  //     if (ind >= 0) {
  //       cards = { ...cards, key: activeGraphCards[key] };
  //     }
  //   });
  //   selectedValues.map((e) => {
  //     if (!cards[e.value]) {
  //       let key = e.value;
  //       let value = <GraphCard selectedValues={e} />;
  //       cards = { ...cards, key: value };
  //     }
  //   });
  //   setGraphCards({ ...cards });
  //   return Object.values(cards);
  // };

  useEffect(() => {
    getSubjectDetailsoftrialfunc();
  }, []);

  return (
    <div>
      {isLoading && <Loader />}
      <div>
        <CRow className="mx-0">
          <CCol>
            {selectedValues && selectedValues[0] && (
              <h4 className="m-0 mb-2">
                Experiment: {selectedValues[0].expname}
              </h4>
            )}
          </CCol>
          <CCol lg="4" className=" ml-auto" style={{ zIndex: '100' }}>
            <Select
              value={selectedValues}
              // value={[
              //   // trialsbysubject.filter((elt) => elt.value === _params.trialid),
              //   {
              //     label: `${_params.trialid}`,
              //     value: `${_params.trialid}`,
              //   },
              // ]}
              isMulti
              placeholder="Please select trials"
              name="colors"
              // isClearable={selectedValues.some((v) => !v.isFixed)}
              options={trialsbysubject}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(e) => setSelectedValues(e)}
            />
          </CCol>
        </CRow>
      </div>

      <div className="mt-3">
        {selectedValues.length > 0 ? (
          selectedValues.map((e, i) => {
            return <GraphCard selectedValues={{ ...e }} />;
          })
        ) : (
          // getGraphCardList()
          <div className="text-center mt-5">
            <h4>Please select Trials from Dropdown</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectGraph;
