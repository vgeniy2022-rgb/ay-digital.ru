import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { markExperimentExplored } from '../core/storage';
import { StudioProjectsPage } from '../../site-builder/pages/StudioProjectsPage';
import './labBuilder.css';

export function LabBuilderPage() {
  useEffect(() => markExperimentExplored('builder'), []);
  return <div className="lab-builder-host"><Link to="/lab" className="lab-builder-badge"><span>01</span><strong>SITEVL LAB</strong><small>WEBSITE BUILDER</small></Link><StudioProjectsPage /></div>;
}
