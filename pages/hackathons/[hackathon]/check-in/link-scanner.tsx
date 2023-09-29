import { useQRCode } from 'next-qrcode';

export default function LinkScanner () {
  const { SVG } = useQRCode();

  const code = '3XQ05G';

  return (
    <div>
        <p>hi</p>
        <SVG
            text={'https://hack.af/a?a=' + code}
            options={{
                errorCorrectionLevel: 'H',
                margin: 3,
                scale: 4,
                width: 500,
                color: {
                dark: '#000000FF',
                light: '#FFFFFFFF',
                },
            }}
        />
    </div>
  );
}

