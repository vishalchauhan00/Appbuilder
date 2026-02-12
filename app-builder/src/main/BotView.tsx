import WebViewer from '../components/WebViewer';

interface BotViewerProps {
  onCloseEditor: () => void;
}
    
const BotView: React.FC<BotViewerProps> = () => {
    
    return (
        <WebViewer
            url="https://developmentconsole.mobilous.com/AppExeBot/" 
            title=""
            height="72vh" width="80vw"
        />
   );
};

export default BotView;
