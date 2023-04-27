using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;

namespace MarqueeCommentsViewer
{
    public class Comment
    {
        public string body { get; set; }
        public double x0 { get; set; }
        public double y0 { get; set; }
        private TextBlock textBlock;
        private Canvas canvas;
        
        public Comment(string _body, double _x0, double _y0)
        {
            body = _body;
            x0 = _x0;
            y0 = _y0;

            textBlock = new TextBlock();
            textBlock.FontSize = 50;
            textBlock.Text = body;
            textBlock.FontWeight = FontWeights.UltraBold;
            textBlock.Foreground = new SolidColorBrush(Colors.White);
            textBlock.FontFamily = new FontFamily("MS Gothic");

            var dropShadow = new DropShadowEffect();
            dropShadow.Color = Colors.Black;
            dropShadow.Direction = 320;
            dropShadow.ShadowDepth = 2;
            dropShadow.Opacity = 0.7;
            textBlock.Effect = dropShadow;
        }

        public void Associate(Canvas _canvas)
        {
            canvas = _canvas;
            Canvas.SetLeft(textBlock, x0);
            Canvas.SetTop(textBlock, y0);
            _canvas.Children.Add(textBlock);
        }

        public void Animate()
        {
            // textBlockのActualWidthを計算
            textBlock.Measure(new Size(Double.PositiveInfinity, Double.PositiveInfinity));
            textBlock.Arrange(new Rect(textBlock.DesiredSize));

            // アニメーションを適用
            var anim = new DoubleAnimation();
            anim.To = -textBlock.ActualWidth;
            anim.Duration = TimeSpan.FromSeconds(5);
            anim.Completed += (s, args) =>
            {
                canvas.Children.Remove(textBlock);
            };

            textBlock.BeginAnimation(Canvas.LeftProperty, anim);
        }
    }
}
